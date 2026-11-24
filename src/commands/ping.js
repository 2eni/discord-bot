import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica se o bot está online'),

    async execute(interaction) {
        await interaction.reply('Pong! 🏓');
    }
};