import Link from "next/link";

import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  const email = session ? session.user?.email : undefined;

  return (
    <div>
      <h1 className="text-2xl">АВС Просмотр</h1>
      <h2 className="text-xl mt-4">
        Веб-приложение для просмотра и хранения смет.
      </h2>

      {email ? <p>Вы авторизованы как {email}</p> : <p>Вы не авторизованы</p>}

      <Link href="/dashboard" className="btn mt-10">
        Перейти к дашборду
      </Link>
    </div>
  );
}
