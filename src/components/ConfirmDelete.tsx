import { TriangleAlert } from "lucide-react";

interface ConfirmDeleteProps {
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDelete({ onClose, onConfirm }: ConfirmDeleteProps) {
    return (
        <div className="flex flex-col justify-center items-center max-w-md rounded-xl bg-white p-6 md:p-8 shadow-xl border border-gray-100">
            <div className="mb-5 flex flex-col items-center gap-4">
                <button
                    type="button"
                    className="self-end text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={onClose}
                >
                    &times;
                </button>
                <TriangleAlert className="text-red-600 w-10 h-10" />
                <p className="flex flex-col text-center font-semibold">Tem certeza que deseja excluir esse item? 
                    <span className="text-sm text-red-600"> 
                        Essa ação não pode ser revertida.
                    </span>
                </p>
            </div>
            <div className="flex gap-2">
                <button type="button"
                    className="bg-gray-400 font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md"
                    onClick={onClose}>
                    Cancelar
                </button>
                <button
                    type="button"
                    className="bg-red-600 text-white font-semibold text-sm p-2 gap-2 hover:opacity-80 cursor-pointer rounded-md"
                    onClick={onConfirm}
                    >
                    Excluir
                </button>
            </div>
        </div>
    )
}