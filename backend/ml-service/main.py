import io
import torch
import torchvision.transforms as transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
import os

from Resnet_embedder import ResNet50Embedder

app = FastAPI()

model = ResNet50Embedder(embedding_dim=256, freeze_base=False)

CHECKPOINT_PATH = "best_model.pth"

try:
    if os.path.exists(CHECKPOINT_PATH):
        checkpoint = torch.load(CHECKPOINT_PATH, map_location=torch.device('cpu'))
        
        if "model_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
        else:
            model.load_state_dict(checkpoint)
            
    else:
        print(f"WARNING: {CHECKPOINT_PATH} not found.")
except Exception as e:
    print(f"Error loading checkpoint: {e}")

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

@app.post("/generate-embedding")
async def generate_embedding(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        tensor = transform(image).unsqueeze(0)
        
        with torch.no_grad():
            embedding = model(tensor)
        
        embedding_list = embedding.squeeze().tolist()
        
        return {"embedding": embedding_list}
        
    except Exception as e:
        print(f"Error processing Image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")