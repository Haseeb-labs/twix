import Layout from '../components/Layout';
import TweetComposer from '../components/TweetComposer';
import InfiniteFeed from '../components/InfiniteFeed';
import { getFeedApi } from '../api/tweets';

export default function HomePage() {
  return (
    <Layout>
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </div>

      <TweetComposer />

      <InfiniteFeed
        queryKey={['feed']}
        queryFn={({ pageParam }) => getFeedApi({ pageParam })}
        emptyMessage={{
          title: 'Your feed is empty',
          subtitle: 'Follow people to see their tweets here. Try the Explore tab to discover accounts.',
        }}
      />
    </Layout>
  );
}
