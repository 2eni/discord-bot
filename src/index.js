
import {
    Client,
    GatewayIntentBits,
    Events,
    Collection
} from 'discord.js';

import 'dotenv/config';

import ping from './commands/ping.js';
import ticket from './commands/ticket.js';
import {
    createTicket,
    closeTicket,
    claimTicket
} from './systems/tickets.js';
import { ticketCategories } from './config/ticketCategories.js';

// 1. Criar conexão com o Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// 2. Criar coleção de comandos
client.commands = new Collection();

// 3. Registrar comandos
client.commands.set(ping.data.name, ping);
client.commands.set(ticket.data.name, ticket);

// 4. Evento de conexão
client.once(Events.ClientReady, (bot) => {
    console.log(`Bot conectado: ${bot.user.tag}`);
});

// 5. Evento de interações
client.on(Events.InteractionCreate, async (interaction) => {

    // Verificar botões
    if (interaction.isButton()) {
        if (interaction.customId === 'fechar_ticket') {
            try {
                await closeTicket(interaction);
            } catch (error) {
                console.error('Erro ao fechar ticket:', error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'Não foi possível fechar o ticket.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'Não foi possível fechar o ticket.',
                        ephemeral: true
                    });
                }
            }

            return;
        }

        if (interaction.customId === 'assumir_ticket') {
            try {
                await claimTicket(interaction);
            } catch (error) {
                console.error('Erro ao assumir ticket:', error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'Não foi possível assumir este ticket.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'Não foi possível assumir este ticket.',
                        ephemeral: true
                    });
                }
            }

            return;
        }

        if (interaction.customId.startsWith('ticket_')) {
            const categoriaId = interaction.customId.replace('ticket_', '');

            const categoria = ticketCategories.find(
                item => item.id === categoriaId
            );

            if (!categoria) {
                await interaction.reply({
                    content: 'Categoria não encontrada.',
                    ephemeral: true
                });
                return;
            }

            await interaction.deferReply({
                ephemeral: true
            });

            try {
                await createTicket(interaction, categoria);
            } catch (error) {
                console.error('Erro ao criar ticket:', error);

                await interaction.editReply({
                    content: 'Não foi possível criar seu ticket. Verifique as permissões do bot.'
                });
            }
        }

        return;
    }

    // Verificar comandos slash
    if (interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);

        } catch (error) {
            console.error('Erro ao executar comando:', error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'Ocorreu um erro ao executar este comando.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'Ocorreu um erro ao executar este comando.',
                    ephemeral: true
                });
            }
        }
    }
});

// 6. Conectar o bot
client.login(process.env.DISCORD_TOKEN);