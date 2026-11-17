---
title: "Usar registros públicos para gerar candidatos no CRM: preservar a fonte e as diferenças para revisão humana"
description: "Apresentamos uma abordagem que separa o arquivo original dos dados públicos do momento da coleta e não aplica automaticamente duplicações, desaparecimentos ou alterações dos candidatos às informações existentes das empresas."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Dados", "CRM", "Operações"]
---

Ao gerar candidatos para o CRM a partir de registros públicos, estabelecimentos com o mesmo nome não pertencem necessariamente à mesma empresa. Não vincule diretamente atualizações ou desaparecimentos de linhas nos dados de origem à atualização de informações existentes ou ao encerramento de empresas; permita que pessoas verifiquem a fonte e as diferenças.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-public-register-snapshot-review">
  <figcaption><strong id="diagram-public-register-snapshot-review">Usar registros públicos para gerar candidatos no CRM: preservar a fonte e as diferenças para revisão humana</strong><span>Apresentamos uma abordagem que separa o arquivo original dos dados públicos do momento da coleta e não aplica automaticamente duplicações, desaparecimentos ou alterações dos candidatos às informações existentes das empresas.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Salvar o original</strong><span>Registrar a fonte, a data de referência e o momento da observação.</span></li>
    <li><strong>Verificar as diferenças</strong><span>Reutilizar originais idênticos e deixar nomes duplicados pendentes.</span></li>
    <li><strong>Decisão humana</strong><span>Conferir os candidatos antes de fazer os registros necessários.</span></li>
  </ol>
</figure>

## Manter o original e as observações separadamente

Registre a URL de origem, as condições de uso, a data de referência informada pelo publicador e o horário da coleta. Mesmo que o original seja igual ao anterior, o horário da nova verificação ou a descrição do publicador podem ser diferentes. Ao separar o armazenamento do conteúdo do arquivo da observação de quando e o que foi verificado, é possível reutilizar o mesmo arquivo e manter o histórico de verificações.

Por exemplo, o [catálogo de dados da cidade de Funabashi](https://www.city.funabashi.lg.jp/shisei/toukei/002/opendata.html) é uma fonte para consultar dados públicos e condições de uso. Verifique também as condições, a data de atualização e o escopo de cada conjunto de dados que for utilizar. O fato de os dados serem públicos não significa que todos os métodos de coleta ou usos sejam permitidos.

## Exibir alterações e desaparecimentos como informações para decisão

Na conferência interna dos registros, comparamos todas as linhas das versões anterior e posterior e exibimos as diferenças de campos para nomes que puderam ser associados de forma inequívoca. Quando há vários registros com o mesmo nome, eles ficam pendentes, sem associação automática. O desaparecimento de uma linha é uma observação de que ela deixou de aparecer nos dados, não uma justificativa para indicar o encerramento ou excluir uma empresa. Endereços e números de telefone também não substituem automaticamente as informações existentes das empresas.

Com dados fictícios, verificamos a reutilização de originais idênticos, alterações e desaparecimentos de campos, a suspensão de nomes duplicados e a retomada após falhas parciais. Este artigo não contém originais reais nem informações comerciais. Como os métodos de atualização e os identificadores variam conforme os dados, essa verificação não garante a possibilidade de coleta automática irrestrita em outros sites.

## Passos para um primeiro teste

Prepare 2 versões de um pequeno CSV fictício e inclua linhas idênticas, alteradas e desaparecidas, além de 2 linhas com o mesmo nome. Salve o original e o horário da observação, exiba apenas os candidatos e confirme que os dados existentes não mudam. Em caso de falha na coleta ou alteração das condições de uso, interrompa o processo e retome-o somente depois que uma pessoa verificar os dados de origem. Defina também o período de retenção e o método de exclusão antes de iniciar a operação. Data de verificação: 2026-11-17.
