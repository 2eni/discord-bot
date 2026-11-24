// 	Criar e fechar tickets

import {
    ChannelType,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from 'discord.js';

import {
    adminRoleIds,
    ticketCategories
} from '../config/ticketCategories.js';

const ticketCategoryId = '1574880505013342388'; // ID da categoria TICKETS

export async function createTicket(interaction, categoria) {
    const { guild, user } = interaction;
    
    console.log('Verificando permissões do ticket...');

    console.log('Servidor:', guild.name);

    console.log('Administrador:', {
        id: adminRoleIds[0],
        existe: guild.roles.cache.has(adminRoleIds[0])
    });

    console.log('Equipe da categoria:', {
        id: categoria.cargoId,
        existe: guild.roles.cache.has(categoria.cargoId)
    });

    console.log('Usuário:', {
        id: user.id,
        existe: guild.members.cache.has(user.id)
    });

    console.log('Categoria TICKETS:', {
        id: ticketCategoryId,
        existe: guild.channels.cache.has(ticketCategoryId)
    });

    // Define as permissões do canal
    const permissions = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: user.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        },

        ...adminRoleIds.map(roleId => ({
            id: roleId,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        })),

        {
            id: categoria.cargoId,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        }
    ];

    // procura um canal entre os canais carregados do servidor.
    const ticketExistente = guild.channels.cache.find(canal => {
            return (
                // verifica se ele pertence à categoria TICKETS.
                canal.parentId === ticketCategoryId &&
                // identifica a categoria e o usuário responsável pelo ticket.
                canal.topic?.startsWith(`ticket:${categoria.id}:${user.id}`)
            );
        });

        if (ticketExistente) {
            await interaction.editReply({
                content: `Você já possui um ticket aberto nesta categoria: ${ticketExistente}`
            });

            return;
        }

    console.log('Verificação completa dos cargos:');

    console.log(
        'Administradores:',
        adminRoleIds.map(id => ({
            id,
            existe: guild.roles.cache.has(id)
        }))
    );

    console.log(
        'Cargo da categoria:',
        categoria.cargoId,
        guild.roles.cache.has(categoria.cargoId)
    );

    console.log(
        'Permissões montadas:',
        permissions
    );

    // Cria o canal privado
    const canal = await guild.channels.create({
        name: `ticket-${categoria.id}-${user.id}`,
        topic: `ticket:${categoria.id}:${user.id}`,
        type: ChannelType.GuildText,
        parent: ticketCategoryId, // coloca o canal dentro da categoria TICKETS.
        permissionOverwrites: permissions
        
    });

    // Confirma a criação
    await interaction.editReply({
        content: `Seu ticket foi criado: ${canal}`
    });

    /// Botão para assumir o atendimento
    const botaoAssumir = new ButtonBuilder()
        .setCustomId('assumir_ticket')
        .setLabel('Resgatar Ticket')
        .setEmoji('🙋')
        .setStyle(ButtonStyle.Success);

    // Botão para fechar o atendimento
    const botaoFechar = new ButtonBuilder()
        .setCustomId('fechar_ticket')
        .setLabel('Fechar Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger);

    // Organizar os botões
    const linha = new ActionRowBuilder()
        .addComponents(botaoAssumir, botaoFechar);

    // Enviar mensagem de boas-vindas
    await canal.send({
        content:
            `Olá, ${user}!\n\n` +
            `Bem-vindo ao atendimento de **${categoria.nome}**!\n` +
            `${categoria.descricao}\n\n` +
            `Equipe responsável: <@&${categoria.cargoId}>\n\n` +
            `Aguarde um membro da equipe. Quando o atendimento terminar, utilize o botão abaixo.`,
        components: [linha]
    });
}

export async function closeTicket(interaction) {
    const { channel, guild, user } = interaction;

    // Verificar se o canal é um ticket
    if (!channel.topic?.startsWith('ticket:')) {
        await interaction.reply({
            content: 'Este canal não é um ticket.',
            ephemeral: true
        });

        return;
    }

    const dados = channel.topic.split(':');

    const categoriaId = dados[1];
    const donoId = dados[2];

    const categoria = ticketCategories.find(
        item => item.id === categoriaId
    );

    if (!categoria) return;

    // Verificar permissões
    const membro = await guild.members.fetch(user.id);

    const autorizado =
        user.id === donoId ||
        adminRoleIds.some(roleId =>
            membro.roles.cache.has(roleId)
        )

    if (!autorizado) {
        await interaction.reply({
            content: 'Você não tem permissão para fechar este ticket.',
            ephemeral: true
        });

        return;
    }

    // Confirmar fechamento
    await interaction.reply({
        content: '🔒 Este ticket será fechado em 5 segundos.'
    });

    setTimeout(async () => {
        await channel.delete('Ticket fechado');
    }, 5000);
}
export async function claimTicket(interaction) {
    const { channel, guild, user } = interaction;

    if (!channel.topic?.startsWith('ticket:')) {
        await interaction.reply({
            content: 'Este canal não é um ticket.',
            ephemeral: true
        });
        return;
    }

    const dados = channel.topic.split(':');

    const categoriaId = dados[1];
    const donoId = dados[2];
    const atendenteAtual = dados[3];

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

    const membro = await guild.members.fetch(user.id);

    const autorizado =
        adminRoleIds.some(roleId =>
            membro.roles.cache.has(roleId)
        )

    if (!autorizado) {
        await interaction.reply({
            content: 'Somente a equipe responsável pode assumir este ticket.',
            ephemeral: true
        });
        return;
    }

    if (atendenteAtual) {
        await interaction.reply({
            content: atendenteAtual === user.id
                ? 'Você já assumiu este atendimento!'
                : `Este ticket já foi assumido por <@${atendenteAtual}>.`,
            ephemeral: true
        });
        return;
    }

    // Registrar quem assumiu
    await channel.setTopic(
        `ticket:${categoriaId}:${donoId}:${user.id}`
    );

    // Impedir que outros membros da equipe enviem mensagens
    await channel.permissionOverwrites.edit(
        categoria.cargoId,
        {
            SendMessages: false
        }
    );

    // Liberar mensagens para o atendente responsável
    await channel.permissionOverwrites.edit(
        user.id,
        {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        }
    );

    await interaction.reply({
        content: `🙋 ${user} assumiu este atendimento!`
    });

    await channel.send({
        content: `O responsável por este atendimento agora é ${user}.`
    });
}