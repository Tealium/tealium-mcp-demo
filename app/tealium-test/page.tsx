import TealiumEventExample from '../components/TealiumEventExample';

export default function TealiumTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Tealium API Integration Demo</h1>
      <p className="text-center mb-8 text-gray-600">
        This page demonstrates the integration with Tealium API using Option 1 - server-side API endpoints
      </p>
      <TealiumEventExample />
    </div>
  );
}
