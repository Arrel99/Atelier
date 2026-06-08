import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Atelier
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
        Sistem pemesanan jasa desain berbasis antrean. Transparan, terukur, saling melindungi.
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Masuk
        </Link>
        <Link
          href="/auth/register"
          className="px-6 py-3 border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}
