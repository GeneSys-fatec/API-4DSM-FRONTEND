interface AdminFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isEditMode: boolean;
}

export function AdminForm({ name, setName, email, setEmail, password, setPassword, isEditMode }: AdminFormProps) {
  return (
    <div className="flex flex-col gap-5 font-inter">
      {/* Campo Nome */}
      <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
        <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
          Nome <span className="text-gray-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
          required
        />
      </div>

      {/* Campo E-mail */}
      <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
        <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
          E-mail <span className="text-gray-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
          required
        />
      </div>

      {/* Campo Senha */}
      <div className="relative border-2 rounded-md px-3 py-2 border-gray-400 focus-within:border-tecsus-green transition-colors">
        <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-700">
          Senha {isEditMode ? <span className="text-gray-500">(opcional)</span> : <span className="text-gray-500">*</span>}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
          required={!isEditMode}
          placeholder={isEditMode ? "Deixe em branco para manter" : ""}
        />
      </div>
    </div>
  );
}
