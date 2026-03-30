import type { Dispatch, SetStateAction } from "react";
import { Check, MapPin, Map, Navigation, Activity, Hash, Type } from "lucide-react";
import type { CreateStationInput } from "@/services/station-service";

interface StationBasicFormProps {
  form: CreateStationInput;
  setForm: Dispatch<SetStateAction<CreateStationInput>>;
}

export function StationBasicForm({ form, setForm }: StationBasicFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-semibold text-gray-700">
          Nome da Estação <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Type className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
            placeholder="Ex: Estação SJC Centro"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-gray-700">
          Código (ID Datalogger) <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.idDatalogger}
            onChange={(e) => setForm((s) => ({ ...s, idDatalogger: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
            placeholder="Ex: DATALOG-01"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-gray-700">
          Cidade / Endereço <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Map className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.address}
            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
            placeholder="Ex: São José dos Campos, SP"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-gray-700">
          Latitude <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.latitude}
            onChange={(e) => setForm((s) => ({ ...s, latitude: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
            placeholder="-23.1791"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-gray-700">
          Longitude <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Navigation className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.longitude}
            onChange={(e) => setForm((s) => ({ ...s, longitude: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
            placeholder="-45.8872"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-gray-700">
          Descrição do Status <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <input
            value={form.status}
            onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
            placeholder="Ex: Operante, Manutenção"
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tecsus-green/20 focus:border-tecsus-green transition-all shadow-sm"
          />
        </div>
      </label>

      <label className="flex items-center gap-3 sm:items-end sm:pb-2 cursor-pointer group">
        <div className="relative flex items-center justify-center w-5 h-5">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded bg-white checked:bg-tecsus-green checked:border-tecsus-green transition-all cursor-pointer shadow-sm"
          />
          <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
        </div>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
          Ativa no Sistema
        </span>
      </label>
    </div>
  );
}