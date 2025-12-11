import { Printer } from 'lucide-react';

/**
 * PrintTicket Component
 * Renders a button that triggers a print dialog for a specific ticket.
 * It dynamically creates a printable area or window.
 */
export default function PrintTicket({ ticket, clinicName = "FilaZero Clinic" }) {

    const handlePrint = () => {
        const printContent = `
            <html>
                <head>
                    <title>Ticket #${ticket.number}</title>
                    <style>
                        body {
                            font-family: 'Courier New', Courier, monospace;
                            text-align: center;
                            width: 300px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .number {
                            font-size: 48px;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                        .info {
                            font-size: 12px;
                            margin-bottom: 5px;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 10px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">${clinicName}</div>
                    <div class="info">${new Date().toLocaleString()}</div>

                    <div class="number">#${ticket.number}</div>

                    <div class="info">Guarde sua senha</div>
                    ${ticket.patientName ? `<div class="info">Paciente: ${ticket.patientName}</div>` : ''}

                    <div class="footer">
                        Obrigado pela preferência.<br/>
                        Acompanhe no painel.
                    </div>
                    <script>
                        window.print();
                        setTimeout(() => window.close(), 500);
                    </script>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
        } else {
            console.error("Popup blocked");
        }
    };

    return (
        <button
            onClick={handlePrint}
            className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Imprimir Senha"
        >
            <Printer size={20} />
        </button>
    );
}
