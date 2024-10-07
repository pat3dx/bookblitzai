import Head from 'next/head';
import Navbar from '../components/Navbar';

const CalendarPage = () => {
  return (
    <div>
      <Head>
        <title>Calendar - MedPostFusionAI</title>
      </Head>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4">Scheduled Posts Calendar</h1>
        <p className="text-lg">View and manage your scheduled blog posts.</p>
        {/* Calendar component with drag-and-drop functionality will go here */}
      </main>
    </div>
  );
};

export default CalendarPage;
