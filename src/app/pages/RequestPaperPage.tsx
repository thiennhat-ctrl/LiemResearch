import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { ArrowLeft } from 'lucide-react';

const existingPapers = [
  { doi: '10.1234/ml.healthcare.2024', link: 'https://example.com/ml-healthcare', title: 'Machine Learning Applications in Healthcare' },
  { doi: '10.1234/dnn.classification.2024', link: 'https://example.com/dnn-classification', title: 'Deep Neural Networks for Image Classification' },
  { doi: '10.1234/nlp.modern.2024', link: 'https://example.com/nlp-modern', title: 'Natural Language Processing in Modern Applications' },
];

export function RequestPaperPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    doi: '',
    link: '',
    abstract: '',
    keywords: '',
    year: '',
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiBaseUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check for duplicates when DOI or link is entered
    if ((name === 'doi' || name === 'link') && value) {
      const duplicate = existingPapers.find(
        paper =>
          (name === 'doi' && paper.doi.toLowerCase() === value.toLowerCase()) ||
          (name === 'link' && paper.link.toLowerCase() === value.toLowerCase())
      );

      if (duplicate) {
        setDuplicateWarning(`⚠️ This ${name.toUpperCase()} already exists in the system: "${duplicate.title}"`);
      } else {
        setDuplicateWarning('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (duplicateWarning) {
      const confirmed = window.confirm(
        'This paper may already exist in the system. Do you still want to submit the request?'
      );
      if (!confirmed) {
        setIsLoading(false);
        return;
      }
    }

    const keywordsList = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const requestBody = {
      title: formData.title,
      doi: formData.doi || undefined,
      paperLink: formData.link || undefined,
      abstract: formData.abstract || undefined,
      keywords: keywordsList,
      publishedYear: formData.year ? parseInt(formData.year) : undefined,
    };

    fetch(`${apiBaseUrl}/api/papers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error || data.message?.toLowerCase().includes('error')) {
          throw new Error(data.message || 'Failed to submit paper request');
        }
        navigate('/my-requests', { replace: true });
      })
      .catch((err) => {
        if (err instanceof TypeError && /fetch/i.test(err.message)) {
          setError(`Failed to fetch. Hãy kiểm tra backend đang chạy tại ${apiBaseUrl}.`);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to submit paper request');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="text-foreground mb-2">Request Research Paper</h1>
            <p className="text-muted-foreground">Fill in the details of the paper you need</p>
          </div>

          <div className="bg-white rounded-lg border border-border shadow-sm p-8">
            {duplicateWarning && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <p className="text-amber-800">{duplicateWarning}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-foreground mb-2">Paper Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Enter the full title of the research paper"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground mb-2">DOI</label>
                  <input
                    type="text"
                    name="doi"
                    value={formData.doi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                    placeholder="10.1234/example.2024"
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2">Publication Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                    placeholder="2024"
                    min="1900"
                    max="2099"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground mb-2">Paper Link</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://example.com/paper"
                />
              </div>

              <div>
                <label className="block text-foreground mb-2">Abstract</label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background resize-none"
                  placeholder="Paste or enter the paper abstract..."
                />
              </div>

              <div>
                <label className="block text-foreground mb-2">Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="machine learning, neural networks, classification"
                />
                <p className="text-muted-foreground mt-2">Separate keywords with commas</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-muted text-muted-foreground py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
