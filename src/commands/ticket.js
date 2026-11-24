// 	Comando para publicar o painel
import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder
} from 'discord.js';

import { ticketCategories } from '../config/ticketCategories.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Envia o painel de atendimento'),
    async execute(interaction) {
        // código para criar os botões fica aqui
        const resultado = ticketCategories.map(categoria => {
            const botao = new ButtonBuilder()
                .setCustomId(`ticket_${categoria.id}`)
                .setLabel(categoria.nome)
                .setEmoji(categoria.emoji)
                .setStyle(ButtonStyle.Primary);

            return botao;
        });

        const linha = new ActionRowBuilder()
            .addComponents(resultado);
        
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 Central de Atendimento')
            .setDescription(
                'Bem-vindo à nossa central de atendimento!\n\n' +
                'Estamos aqui para ajudar você. Selecione abaixo a categoria ' +
                'que melhor representa sua necessidade para iniciar um atendimento.\n\n' +
                '**Como funciona?**\n' +
                '1. Escolha uma das categorias.\n' +
                '2. Um canal privado será criado para você.\n' +
                '3. Nossa equipe dará continuidade ao atendimento.'
            )
            .setFooter({
                text: 'Fluxo Supply Store • Atendimento'
            })
            .setTimestamp();
            
        await interaction.reply({
            embeds: [embed],
            components: [linha]
        });
    }
};