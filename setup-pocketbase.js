/**
 * Script para criar a collection "tickets" no PocketBase via API
 * Execute com: node setup-pocketbase.js
 */

const POCKETBASE_URL = 'http://127.0.0.1:8090';

async function checkAndCreateCollection() {
    console.log('🚀 Configurando PocketBase para FilaZero Saúde...\n');

    // Check if PocketBase is running
    try {
        const healthCheck = await fetch(`${POCKETBASE_URL}/api/health`);
        if (!healthCheck.ok) throw new Error('PocketBase not responding');
        console.log('✅ PocketBase está rodando\n');
    } catch (e) {
        console.error('❌ PocketBase não está disponível em ' + POCKETBASE_URL);
        console.log('\nInicie o PocketBase com: cd backend && ./pocketbase serve\n');
        process.exit(1);
    }

    // Check if tickets collection exists by trying to access it
    try {
        const ticketsCheck = await fetch(`${POCKETBASE_URL}/api/collections/tickets`);
        if (ticketsCheck.ok) {
            console.log('✅ Collection "tickets" já existe!\n');
            console.log('🎉 PocketBase está pronto para uso!\n');
            console.log('📋 Acesse: http://localhost:5173 para o frontend');
            console.log('🔧 Admin UI: http://127.0.0.1:8090/_/\n');
            return;
        }
    } catch (e) {
        // Collection doesn't exist, that's fine
    }

    console.log('⚠️  Collection "tickets" não existe.');
    console.log('\n📝 INSTRUÇÕES PARA CRIAR A COLLECTION:');
    console.log('─'.repeat(50));
    console.log('\n1. Acesse: http://127.0.0.1:8090/_/');
    console.log('2. Crie uma conta de administrador (na primeira vez)');
    console.log('3. Clique em "New Collection"');
    console.log('4. Nome: tickets');
    console.log('\n5. Adicione os seguintes campos:');
    console.log('   • number (Number) - Required');
    console.log('   • status (Select) - Options: waiting, called, in_service, done, cancelled');
    console.log('   • clinicId (Text) - Required');
    console.log('   • patientName (Text)');
    console.log('   • channel (Text)');
    console.log('   • calledAt (Date)');
    console.log('   • startedAt (Date)');
    console.log('   • finishedAt (Date)');
    console.log('\n6. Na aba "API Rules", configure:');
    console.log('   • List/Search Rule: (deixe vazio para permitir todos)');
    console.log('   • View Rule: (deixe vazio)');
    console.log('   • Create Rule: (deixe vazio)');
    console.log('   • Update Rule: (deixe vazio)');
    console.log('   • Delete Rule: @request.auth.id != ""');
    console.log('\n7. Clique em "Create"\n');
    console.log('─'.repeat(50));
    console.log('\n💡 Até lá, o app funcionará em modo MOCK (dados em localStorage)\n');
}

checkAndCreateCollection();
