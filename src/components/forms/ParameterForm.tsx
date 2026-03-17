interface ParameterFormProps {
    onClose: () => void;
    mode: "create" | "edit";
}

export function ParameterForm({ onClose, mode }: ParameterFormProps) {
    const isEditMode = mode === "edit";

    return (
        <div className="w-[92vw] max-w-xl rounded-xl bg-white p-5 md:p-6 shadow-xl border border-gray-100">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                    {isEditMode ? "Editar parâmetro" : "Novo parâmetro"}
                </h1>
                <button
                    type="button"
                    className="text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
            <form className="flex flex-col justify-center gap-5">
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Nome <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full outline-none text-sm"
                        required
                    />
                </div>
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Unidade de medida <span className="text-gray-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full outline-none text-sm"
                        required
                    />
                </div>
                <div className="flex justify-between">
                    <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Fator <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            className="w-full outline-none text-sm"
                            required
                        />
                    </div>
                    <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                            Desvio (offset) <span className="text-gray-500">*</span>
                        </label>
                        <input
                            type="number"
                            className="w-full outline-none text-sm"
                            required
                        />
                    </div>
                </div>
                <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs">
                        Observações <span className="text-gray-500">(opcional)</span>
                    </label>
                    <textarea
                        className="w-full outline-none text-sm"
                        required
                    />
                </div>
                <div className="flex self-end gap-2">
                    <button type="button"
                        className="bg-gray-400 font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md"
                        onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit"
                        className="bg-tecsus-green text-white font-semibold text-sm p-2 gap-2 opacity-80 hover:opacity-100 cursor-pointer rounded-md">
                        {isEditMode ? "Salvar" : "Enviar"}
                    </button>
                </div>
            </form>
        </div>
    )
}