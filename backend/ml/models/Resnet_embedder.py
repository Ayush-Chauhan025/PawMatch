import torch
import torch.nn as nn
import torchvision.models as models
import torch.nn.functional as F

class ResNet50Embedder(nn.Module):
    def __init__(self, embedding_dim=256, freeze_base=False):
        super().__init__()
        self.freeze_base = freeze_base
        
        self.backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity() 

        self.embedder = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512), 
            nn.ReLU(),
            nn.Linear(512, embedding_dim)
        )
        
        if self.freeze_base:
            for param in self.backbone.parameters():
                param.requires_grad = False

    def forward(self, x):
        x = self.backbone(x)
        x = self.embedder(x)
        x = F.normalize(x, p=2, dim=1)
        return x

    def train(self, mode=True):
        super().train(mode)
        if self.freeze_base:
            self.backbone.eval()
            if mode:
                self.embedder.train()