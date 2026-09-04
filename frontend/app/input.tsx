import { Image as ImageIcon } from "lucide-react";

type InputBoxProps = {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

export default function Input_Box({setFiles}: InputBoxProps) {;

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles((previousFiles) => {
      return [...previousFiles, ...selectedFiles].slice(0, 3);
    });
    e.target.value = "";
  }

  return (
    <div className="w-full border-2 border-dotted border-orange-600 bg-orange-100 rounded-xl p-6">
      <label
        htmlFor="pet-image"
        className="flex flex-col justify-center items-center cursor-pointer"
      >
        <ImageIcon size={40} className="mb-3 text-orange-600" />

        <div className="font-bold text-center">
          Drop a photo here, or click to Browse
        </div>

        <p className="text-center text-gray-800 mt-2">
          JPG or PNG works best.
        </p>
      </label>

      <input
        id="pet-image"
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImage(e)}
      />
    </div>
  );
}
