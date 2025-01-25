# Реализация авторизации

`Next.js` `Prisma` `NextAuth.js` `PostgreSQL` `Docker`

## Этапы
1. Добавить верстку для страниц авторизации, регистрации и дашборда (страницы, доступной только авторизованным пользователям)
2. Настроить `Prisma`. 


### Настройка `Prisma`
1. `npm install prisma --save-dev`
2. `npx prisma init --datasource-provider postgresql`. В выводе команды есть подсказки, что делать дальше. Команда создаст директорию `./prisma`, а в ней файл `schema.prisma`. 
3. Создать файл `.env` с переменной `DATABASE_URL`. 
4. В `./prisma/schema.prisma` описать первую модель данных. Например,
    ```prisma
    model User {
      id       Int     @id @default(autoincrement())
      name     String?
      email    String  @unique
      password String?
    }
    ```
5. `npx prisma migrate dev --name init`. Нужно выполнить миграцию, чтобы синхронизировать изменения в `schema.prisma` с базой данных. 
6. `npm install @prisma/client`. Предыдущая команда автоматически установит `@prisma/client`, но, если этого не произошло, нужно сделать это вручную.
7. Чтобы проверить, что все ок, можно создать тестовый роут `./src/app/api/test/route.ts`
   ```typescript
   import { prisma } from "../../../../prisma/prisma";
   
   export async function GET() {
      const allUsers = await prisma.user.findMany();
      console.log(allUsers);
   
      return Response.json({ allUsers });
   }
   ```
8. Вручную создать в БД пару пользователей. 
9. Отправить GET-запрос по созданному роуту `curl http://localhost:3001/api/test`. Убедиться, что тестовые пользователи вывелись в консоль. 
