import { REST, Routes } from 'discord.js';
import 'dotenv/config';

// Importar os comandos
import ping from './commands/ping.js';
import ticket from './commands/ticket.js';

// Lista de comandos que serão registrados
const commands = [
    ping.data.toJSON(),
    ticket.data.toJSON()
];

// Configurar conexão com a API do Discord
const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

// Registrar os comandos
async function deployCommands() {
    try {
        console.log('Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Comandos registrados com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
}

deployCommands();