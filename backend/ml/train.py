import os
import random

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter

from dataloaders.triplet_dataset import CustomDataset
from models.Resnet_embedder import ResNet50Embedder


def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def main():
    set_seed(42)

    BATCH_SIZE = 32
    EPOCHS = 10
    MARGIN = 1.0
    FREEZE_BASE = False
    RESUME_CHECKPOINT = "/content/drive/MyDrive/data/weights/latest_checkpoint.pth"
    LEARNING_RATE = 1e-5

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"Using device: {device} | Phase 2 (Fine-tuning) | LR: {LEARNING_RATE}")

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    train_paths = [
        os.path.join(BASE_DIR, "datasets", "facenet", "train"),
        os.path.join(BASE_DIR, "datasets", "yy-bb-dog", "train")
    ]

    val_paths = [
        os.path.join(BASE_DIR, "datasets", "facenet", "test"),
        os.path.join(BASE_DIR, "datasets", "yy-bb-dog", "test")
    ]

    print(f"Training on paths: {train_paths}")
    print(f"Validating on paths: {val_paths}")

    print("\nLoading Training Dataset...")
    train_dataset = CustomDataset(root_dirs=train_paths)

    print("\nLoading Validation Dataset...")
    val_dataset = CustomDataset(root_dirs=val_paths)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)

    model = ResNet50Embedder(embedding_dim=256, freeze_base=FREEZE_BASE)
    model.to(device)

    trainable_params = filter(lambda p: p.requires_grad, model.parameters())

    optimizer = optim.Adam(trainable_params, lr=LEARNING_RATE, weight_decay=1e-4)
    criterion = nn.TripletMarginLoss(margin=MARGIN, p=2)

    start_epoch = 0

    if RESUME_CHECKPOINT is not None:
        print(f"\nLoading checkpoint: {RESUME_CHECKPOINT}")

        checkpoint = torch.load(RESUME_CHECKPOINT, map_location=device)

        model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

        start_epoch = checkpoint["epoch"]

        print("Checkpoint loaded successfully!")
        print(f"Saved at Epoch: {checkpoint['epoch'] + 1}")
        print(f"Saved at Batch: {checkpoint['batch'] + 1}")
        print(f"Saved Loss: {checkpoint['loss']:.4f}")

    weights_dir = os.path.join(BASE_DIR, "..", "data", "weights")
    os.makedirs(weights_dir, exist_ok=True)

    best_val_loss = 1.75

    writer = SummaryWriter(log_dir=os.path.join(BASE_DIR, "runs", "phase2_finetune"))

    for epoch in range(start_epoch, EPOCHS):
        model.train()
        running_train_loss = 0.0

        for batch_idx, (anchor, positive, negative) in enumerate(train_loader):
            anchor = anchor.to(device)
            positive = positive.to(device)
            negative = negative.to(device)

            optimizer.zero_grad()

            emb_a = model(anchor)
            emb_p = model(positive)
            emb_n = model(negative)

            loss = criterion(emb_a, emb_p, emb_n)

            loss.backward()
            optimizer.step()

            if (batch_idx + 1) % 100 == 0:
                checkpoint_path = os.path.join(weights_dir, "latest_checkpoint.pth")

                torch.save({
                    "epoch": epoch,
                    "batch": batch_idx,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "loss": loss.item()
                }, checkpoint_path)

                print(f"Checkpoint saved: Epoch {epoch + 1}, Batch {batch_idx + 1}")

            running_train_loss += loss.item()

            if (batch_idx + 1) % 10 == 0:
                print(f"Epoch [{epoch + 1}/{EPOCHS}] | Batch [{batch_idx + 1}/{len(train_loader)}] | Train Loss: {loss.item():.4f}")

        avg_train_loss = running_train_loss / len(train_loader)

        checkpoint_path = os.path.join(weights_dir, "latest_checkpoint.pth")

        torch.save({
            "epoch": epoch,
            "batch": batch_idx,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "loss": loss.item()
        }, checkpoint_path)

        print(f"Epoch checkpoint saved: Epoch {epoch + 1}")

        model.eval()
        running_val_loss = 0.0

        set_seed(42)

        with torch.no_grad():
            for anchor, positive, negative in val_loader:
                anchor = anchor.to(device)
                positive = positive.to(device)
                negative = negative.to(device)

                emb_a = model(anchor)
                emb_p = model(positive)
                emb_n = model(negative)

                loss = criterion(emb_a, emb_p, emb_n)

                running_val_loss += loss.item()

        avg_val_loss = running_val_loss / len(val_loader)

        print(f"==> Epoch {epoch + 1} Complete | Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}")

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss

            best_model_path = os.path.join(weights_dir, "best_model.pth")
            torch.save(model.state_dict(), best_model_path)

            print(f"New best model saved to {best_model_path} (Val Loss: {best_val_loss:.4f})")
        else:
            print()

        writer.add_scalars("Loss/Epoch", {"Train": avg_train_loss, "Validation": avg_val_loss}, epoch + 1)

    writer.close()


if __name__ == "__main__":
    main()