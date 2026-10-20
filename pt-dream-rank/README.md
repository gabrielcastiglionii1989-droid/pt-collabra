# PT Dream Rank

Área independente para o ranking personalizado, sem alterar a página principal existente do repositório.

## O que esta versão prepara
- Front-end web para login Google e gestão de personagens, loot e custos de boosts.
- Cloud Function agendada a cada 6 horas para consultar personagens na TibiaData API v4 e guardar snapshots no Firestore.
- Firebase Hosting, Firestore rules e GitHub Actions para deploy automático.

## Antes de usar
1. Crie/seleciona um projeto no Firebase Console.
2. Ative Authentication > Google e Firestore Database.
3. Registre um app Web no Firebase e preencha `firebase-config.js` com a configuração pública do app.
4. Adicione o domínio publicado em Authentication > Settings > Authorized domains.
5. No GitHub, em Settings > Secrets and variables > Actions, configure:
   - `FIREBASE_PROJECT_ID`: ID do projeto Firebase.
   - `FIREBASE_SERVICE_ACCOUNT`: JSON completo de uma conta de serviço com permissões para deploy. Nunca publique esse JSON.
6. O workflow `.github/workflows/deploy-pt-dream-rank.yml` publica Hosting, Functions e regras após push na branch `main`.

A agenda de Cloud Functions exige plano Firebase Blaze com faturamento ativado; confira custos antes de habilitar.

## Fontes e histórico
TibiaData v4 é a fonte principal. Os snapshots começam após o primeiro deploy; não há reconstrução retroativa garantida para XP diária/7/30 dias. GuildStats pode ser complementar apenas quando o histórico estiver acessível publicamente; o projeto não contorna desafios Cloudflare.

## Limitações desta primeira publicação
O ranking geral de todos os personagens do mundo e a importação histórica do GuildStats ainda precisam de uma implementação específica. Itens e boosts são registros informados pelo usuário, pois não são dados fornecidos pela TibiaData.
