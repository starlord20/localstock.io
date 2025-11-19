import fs from 'fs';
import path from 'path';

export default function PrivacyPage() {
  const mdPath = path.join(process.cwd(), 'public', 'privacy.md');
  let content = '';
  try {
    content = fs.readFileSync(mdPath, 'utf8');
  } catch (err) {
    content = 'Privacy policy is currently unavailable.';
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded">{content}</pre>
    </div>
  );
}
