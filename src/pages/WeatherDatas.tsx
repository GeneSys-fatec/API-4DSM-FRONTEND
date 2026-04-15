import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { WeatherTable } from "@/components/WeatherTable";

export function WeatherDatas() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "table">("dashboard");

    return (
        <>
            <div className="flex p-1 bg-gray-100/80 rounded-lg m-1">
                <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "dashboard" ? "bg-tecsus-green text-white shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                >
                    1. Dashboard
                </button>
                <button
                    onClick={() => setActiveTab("table")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "table" ? "bg-tecsus-green text-white shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        }`}
                >
                    2. Tabela
                </button>
            </div>
            <div id="station-form" className="flex flex-col">
                {activeTab === "dashboard" && (
                    <Dashboard />
                )}
                {activeTab === "table" && (
                    <WeatherTable />
                )}
            </div>
        </>


    )
}