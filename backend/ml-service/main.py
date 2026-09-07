import os
from tkinter import Image
from sympy import false
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models
import torchvision.transforms as transforms
from pydantic import BaseModel
from PIL import Image
import requests
from io import BytesIO
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = models.resnet50(pretrained=false)
model.fc = torch.nn.Linear(model.fc.in_features, 256)

class ResNet50Embedder(nn.Module):
    def __init__(self, embedding_dim=256, freeze_base=False):
        super.__init__()
        self.freeze_base = freeze_base

        self.backbone = models.resnet50(weights=None)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()

        self.embedder = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Linear(512, embedding_dim),
        )

        if self.freeze_base:
            for param in self.backbone.parameters():
                param.requires_grad = False

    def forward(self, x):
        x = self.backbone
        x = self.embedder
        x = F.normalize(x, p=2, dim=1)
        return x

model = ResNet50Embedder()
model_path = "best_model.pth"

try:
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    print("Model path loaded")
except FileNotFoundError:
    print(f"{model_path} not found. Operating with random weights.")
except RuntimeError as re:
    print(f"runtime error: ${str(re)}")
    try:
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint["model_state_dict"])
        print(f"Loaded checkpoint dictionary from {model_path}")
    except Exception as inner_re:
        print(f"Failed to load as checkpoint: {str(inner_re)}")

model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

class EmbeddingRequest(BaseModel):
    imageId: str
    imageUrl: str

def process_and_save_embedding(imageId: str, imageUrl: str):
    try:
        response = requests.get(imageUrl, timeout=10)
        img = Image.open(BytesIO(response.content)).convert('RGB')
        
        img_tensor = transform(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            embedding = model(img_tensor)
        
        embedding_list = embedding.squeeze().cpu().numpy().tolist()
        
        supabase.table('PetImage').update({
            "embedding": embedding_list
        }).eq("id", imageId).execute()
        print("Embedding saved")
    except Exception as ex:
        print(f"error processing Image: ${str(ex)}")


@app.post("/generate-embedding")
async def generate_embedding(req: EmbeddingRequest):
    try:
        process_and_save_embedding(req.imageId, req.imageUrl)
        return {"status": "success", "imageId": req.imageId, "message": "Embedding saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))