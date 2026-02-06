import './globals.css';

export const metadata = {
  title: 'NEXUS eSports | Киберспортивная Арена',
  description: 'Киберспортивная арена нового поколения NEXUS eSports'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet" />
        <script src="https://unpkg.com/aos@2.3.4/dist/aos.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
