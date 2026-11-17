---
title: "Restaurar materiais de edição de vídeo e música com Git e DVC: verificar reprodução e edição separadamente"
description: "Como associar definições de edição no Git aos materiais no DVC e verificar, em sequência, hashes, reprodução e novo salvamento no aplicativo de edição."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Git", "DVC", "Produção"]
---

Mesmo que um arquivo final de vídeo ou música possa ser reproduzido, não é garantido que a edição possa ser retomada: referências aos materiais podem estar quebradas ou aplicativos necessários podem estar ausentes. Ao gerenciar definições de edição com Git e associar versões de materiais grandes com DVC, registre separadamente o que foi possível restaurar.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-git-dvc-creative-restore">
  <figcaption><strong id="diagram-git-dvc-creative-restore">Restaurar materiais de edição de vídeo e música com Git e DVC: verificar reprodução e edição separadamente</strong><span>Como associar definições de edição no Git aos materiais no DVC e verificar, em sequência, hashes, reprodução e novo salvamento no aplicativo de edição.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Fixar a versão</strong><span>Alinhar as definições de edição e as referências aos materiais.</span></li>
    <li><strong>Restaurar de forma independente</strong><span>Obter os dados a partir de um cache vazio e conferir os hashes.</span></li>
    <li><strong>Verificar os usos</strong><span>Testar separadamente a reprodução do arquivo exportado e a edição com novo salvamento.</span></li>
  </ol>
</figure>

## O que alinhar com Git e DVC

Armazene no Git os projetos de edição, o inventário de materiais e as informações de referência do DVC, e gerencie os arquivos grandes de vídeo e áudio com DVC. Registre também no inventário a origem e as condições de uso dos materiais. Uma referência no Git, por si só, não prova que os arquivos foram armazenados; por isso, verifique separadamente o envio ao destino de armazenamento e a obtenção independente dos dados. A [documentação do pull do DVC](https://doc.dvc.org/command-reference/pull) explica como obter os dados correspondentes às referências.

## Restaurar a partir de um cache vazio e conferir

Em uma plataforma interna de produção de vídeo, usamos um cache vazio e independente para alternar entre 2 versões e conferimos o SHA-256 dos materiais após retornar à versão original. Também verificamos as referências relativas nas definições de edição, e os vídeos de 8 segundos gerados a partir do original e da restauração coincidiram byte a byte. Esse é o resultado de uma restauração e exportação locais de escopo limitado; não comprova a restauração a partir de armazenamento externo ou em outro PC, nem o novo salvamento na interface de edição.

Em outra versão de vídeo, restauramos 60 materiais de um destino de armazenamento local para um cache vazio e conferimos os hashes e as referências nas definições de edição. Nesse teste, a sincronização com a nuvem e o recarregamento na interface de edição não foram realizados. Se o destino de armazenamento mudar, repita o mesmo procedimento para o novo destino.

Em outro teste de produção musical, restauramos 7 mídias a partir de um cache local independente e conferimos os hashes, os tamanhos e as referências relativas de 3 stems e das definições de edição de vídeo. Com o processamento native do Ardour, salvamos, recarregamos e exportamos a duração completa; a diferença PCM em relação ao WAV de referência foi 0. Essa verificação utilizou processamento native. Nesse teste, não realizamos a sequência de verificação pela GUI — editar, salvar com outro nome e reabrir —, uma nova restauração a partir de armazenamento externo ou a verificação em outro PC.

## Verificar a reprodução e a edição

1. Restaure a versão desejada do Git e os materiais em um local onde os originais não sejam sobrescritos.
2. Verifique os hashes do inventário, os caminhos de referência e a ausência de materiais.
3. Reproduza o vídeo ou áudio exportado e verifique a duração e possíveis ausências.
4. Abra o projeto no aplicativo de edição, salve-o novamente com outro nome e reabra-o para verificar o estado da edição.

A versão do aplicativo, fontes, plugins, bibliotecas de som e direitos de uso também afetam a restauração. Mesmo que a comparação automática coincida, uma pessoa precisa verificar se a qualidade do som e da imagem corresponde ao pretendido. Primeiro, teste toda a sequência em um projeto curto com materiais fictícios e registre a data da verificação e os destinos de armazenamento ainda não verificados. Data da verificação: 2026-11-17.
