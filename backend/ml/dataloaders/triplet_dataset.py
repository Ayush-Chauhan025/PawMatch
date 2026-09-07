import os
import random
from PIL import Image, ImageFile
import torch
from torch.utils.data import Dataset
import torchvision.transforms as transforms

ImageFile.LOAD_TRUNCATED_IMAGES = True

class CustomDataset(Dataset):
    def __init__(self, root_dirs, transform=None):
        # Auto-wrap string to list
        if isinstance(root_dirs, str):
            root_dirs = [root_dirs]

        self.transform = transform or transforms.Compose([
            transforms.Resize((224, 224)),

            transforms.RandomRotation(degrees=10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], 
                std=[0.229, 0.224, 0.225]
            )
        ])

        self.classes = []
        self.class_to_images = {}
        self.all_images = []

        for root_dir in root_dirs:
            if not os.path.exists(root_dir):
                raise FileNotFoundError(f"Dataset directory not found: {root_dir}")

            for identity_folder in os.listdir(root_dir):
                folder_path = os.path.join(root_dir, identity_folder)
                
                if not os.path.isdir(folder_path):
                    continue

                images = [
                    os.path.join(folder_path, img)
                    for img in os.listdir(folder_path)
                    if img.lower().endswith((".png", ".jpg", ".jpeg"))
                ]

                if len(images) > 1:
                    class_id = f"{root_dir}_{identity_folder}"
                    self.classes.append(class_id)
                    self.class_to_images[class_id] = images
                    for img in images:
                        self.all_images.append((img, class_id))

        if len(self.classes) < 2:
            raise ValueError("Need at least 2 distinct dog identities with >1 image each.")

        print(f"Loaded {len(self.classes)} identities across {len(self.all_images)} total images.")

    def __len__(self):
        return len(self.all_images)

    def __getitem__(self, idx):
        anchor_path, anchor_class = self.all_images[idx]

        pos_candidates = [p for p in self.class_to_images[anchor_class] if p != anchor_path]
        positive_path = random.choice(pos_candidates)

        neg_candidates = [c for c in self.classes if c != anchor_class]
        negative_class = random.choice(neg_candidates)
        negative_path = random.choice(self.class_to_images[negative_class])

        anchor_img = Image.open(anchor_path).convert("RGB")
        positive_img = Image.open(positive_path).convert("RGB")
        negative_img = Image.open(negative_path).convert("RGB")

        anchor_tensor = self.transform(anchor_img)
        positive_tensor = self.transform(positive_img)
        negative_tensor = self.transform(negative_img)

        return anchor_tensor, positive_tensor, negative_tensor