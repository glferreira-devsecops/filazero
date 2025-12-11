import { Bell, Building2, Clock, LogOut, Save, Settings as SettingsIcon, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

/**
 * Settings Page
 * Comprehensive clinic configuration with sections
 */
export default function Settings() {
    const { currentUser, logout } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const clinicId = currentUser?.id;

    // Use global settings state
    const { settings, updateSettings } = useSettings();
    const [saving, setSaving] = useState(false);

    // Save settings (already handled by updateSettings, but we can simulate a "save" action for UX)
    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real app, we might also sync to backend here
            await new Promise(r => setTimeout(r, 500));
            addToast('✅ Configurações salvas!', 'success');
        } catch (e) {
            addToast('Erro ao salvar', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Update setting wrapper
    const handleUpdate = (key, value) => {
        updateSettings({ [key]: value });
    };

    // Toggle work day
    const toggleWorkDay = (day) => {
        handleUpdate('workDays', settings.workDays.includes(day)
            ? settings.workDays.filter(d => d !== day)
            : [...settings.workDays, day]
        );
    };

    const WORK_DAYS = [
        { key: 'dom', label: 'Dom' },
        { key: 'seg', label: 'Seg' },
        { key: 'ter', label: 'Ter' },
        { key: 'qua', label: 'Qua' },
        { key: 'qui', label: 'Qui' },
        { key: 'sex', label: 'Sex' },
        { key: 'sab', label: 'Sáb' }
    ];

    // Section component
    const Section = ({ icon: Icon, title, children }) => (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Icon size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            {children}
        </div>
    );

    // Input field component
    const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
        </div>
    );

    // Toggle component
    const Toggle = ({ label, description, checked, onChange }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-white font-medium">{label}</p>
                {description && <p className="text-slate-400 text-sm">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-transform ${checked ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24">
            <div className="container max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <SettingsIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Configurações</h1>
                            <p className="text-slate-400 text-sm font-medium">Clínica {clinicId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all font-medium text-sm"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </header>

                {/* Clinic Info */}
                <Section icon={Building2} title="Informações da Clínica">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Nome da Clínica"
                            value={settings.clinicName}
                            onChange={(v) => handleUpdate('clinicName', v)}
                            placeholder="Nome da sua clínica"
                        />
                        <InputField
                            label="Telefone"
                            value={settings.clinicPhone}
                            onChange={(v) => handleUpdate('clinicPhone', v)}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                    <InputField
                        label="Endereço"
                        value={settings.clinicAddress}
                        onChange={(v) => handleUpdate('clinicAddress', v)}
                        placeholder="Endereço completo"
                    />
                </Section>

                {/* Operation Hours */}
                <Section icon={Clock} title="Horário de Funcionamento">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputField
                            label="Abertura"
                            value={settings.openTime}
                            onChange={(v) => handleUpdate('openTime', v)}
                            type="time"
                        />
                        <InputField
                            label="Fechamento"
                            value={settings.closeTime}
                            onChange={(v) => handleUpdate('closeTime', v)}
                            type="time"
                        />
                        <InputField
                            label="Início Almoço"
                            value={settings.lunchStart}
                            onChange={(v) => handleUpdate('lunchStart', v)}
                            type="time"
                        />
                        <InputField
                            label="Fim Almoço"
                            value={settings.lunchEnd}
                            onChange={(v) => handleUpdate('lunchEnd', v)}
                            type="time"
                        />
                    </div>

                    {/* Work Days */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dias de Funcionamento</label>
                        <div className="flex flex-wrap gap-2">
                            {WORK_DAYS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => toggleWorkDay(key)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${settings.workDays.includes(key)
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Notifications */}
                <Section icon={Bell} title="Notificações">
                    <Toggle
                        label="Som de Alerta"
                        description="Toca som quando um paciente é chamado"
                        checked={settings.soundEnabled}
                        onChange={(v) => handleUpdate('soundEnabled', v)}
                    />
                    <Toggle
                        label="Anúncio por Voz"
                        description="Anuncia o número da senha por voz"
                        checked={settings.voiceEnabled}
                        onChange={(v) => handleUpdate('voiceEnabled', v)}
                    />
                    <Toggle
                        label="Notificações do Navegador"
                        description="Receba notificações mesmo com a aba minimizada"
                        checked={settings.browserNotifications}
                        onChange={(v) => handleUpdate('browserNotifications', v)}
                    />
                </Section>

                {/* Queue Settings */}
                <Section icon={User} title="Configurações da Fila">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo Máximo de Espera (min)</label>
                            <input
                                type="number"
                                value={settings.maxWaitTime}
                                onChange={(e) => handleUpdate('maxWaitTime', parseInt(e.target.value))}
                                min="15"
                                max="180"
                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeout No-Show (min)</label>
                            <input
                                type="number"
                                value={settings.noShowTimeout}
                                onChange={(e) => handleUpdate('noShowTimeout', parseInt(e.target.value))}
                                min="1"
                                max="15"
                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Chamar Próximo (seg)</label>
                            <input
                                type="number"
                                value={settings.autoCallNextDelay}
                                onChange={(e) => handleUpdate('autoCallNextDelay', parseInt(e.target.value))}
                                min="0"
                                max="120"
                                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                    </div>

                    <Toggle
                        label="Exigir Nome do Paciente"
                        description="Pacientes devem informar o nome ao retirar senha"
                        checked={settings.requirePatientName}
                        onChange={(v) => handleUpdate('requirePatientName', v)}
                    />
                    <Toggle
                        label="Permitir Senhas Anônimas"
                        description="Pacientes podem retirar senha sem identificação"
                        checked={settings.enableAnonymousTickets}
                        onChange={(v) => handleUpdate('enableAnonymousTickets', v)}
                    />
                </Section>

                {/* Security */}
                <Section icon={Shield} title="Segurança">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                        ⚡ <strong>Modo Demo:</strong> Algumas configurações de segurança estão limitadas no modo demo.
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-white/5 mt-4">
                        <div>
                            <p className="text-white font-medium">Encerrar Sessão</p>
                            <p className="text-slate-400 text-sm">Sair da conta atual</p>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all font-medium text-sm"
                        >
                            <LogOut size={18} />
                            Sair
                        </button>
                    </div>
                </Section>

            </div>
        </div>
    );
}
