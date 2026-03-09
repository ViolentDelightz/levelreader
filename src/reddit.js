/**
 * Reach out to the reddit API, and get the first page of results from
 * r/aww. Filter out posts without readily available images or videos,
 * and return a random result.
 * @returns The url of an image or video which is cute.
 */
export async function getCuteUrl() {
  const response = await fetch(redditUrl, {
    headers: {
      'User-Agent': 'justinbeckwith:awwbot:v1.0.0 (by /u/justinblat)',
    },
  });
  if (!response.ok) {
    let errorText = `Error fetching ${response.url}: ${response.status} ${response.statusText}`;
    try {
      const error = await response.text();
      if (error) {
        errorText = `${errorText} \n\n ${error}`;
      }
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
  const data = await response.json();
  const posts = data?.data?.children;
  if (!Array.isArray(posts)) {
    throw new Error('Unexpected response structure from Reddit API');
  }
  const urls = posts
    .map((post) => {
      const d = post?.data;
      if (!d) return '';
      // Skip gallery posts — they don't have a single direct media URL
      if (d.is_gallery) return '';
      // Skip NSFW posts
      if (d.over_18) return '';
      return (
        d.media?.reddit_video?.fallback_url ||
        d.secure_media?.reddit_video?.fallback_url ||
        d.url ||
        ''
      );
    })
    .filter((url) => {
      if (!url) return false;
      // Only allow URLs that look like images or videos
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    });
  if (!urls.length) {
    throw new Error('No valid posts found in the Reddit API response');
  }
  const randomIndex = Math.floor(Math.random() * urls.length);
  return urls[randomIndex];
}

export const redditUrl = 'https://www.reddit.com/r/aww/hot.json';
