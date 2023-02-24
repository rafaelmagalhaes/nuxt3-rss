import RSS from 'rss';

export default defineEventHandler(async (event) => {
  // wrap everything in a try catch block
  try {
    // fetch data from dev.to
    const response = await fetch(
      'https://dev.to/search/feed_content?per_page=15&page=0&user_id=138553&class_name=Article&sort_by=published_at&sort_direction=desc&approved='
    );

    // throw an error if the response is not ok
    if (!response.ok) {
      throw new Error(response?.status);
    }

    /*
      await for response.json()
      the api returns an object with the result key and result contains all our articles inside an array
      assign result to posts
     */
    const {result:posts} = await response.json();

    // create new rss feed this will be our channel tag with website title and url
    const feed = new RSS({
      title: 'Rafael Magalhaes',
      site_url: 'https://dev.to/rafaelmagalhaes', // link to your website/blog
      feed_url: `https://blog.rrrm.co.uk/rss`, // path to your rss feed
    });
    // loop over each posts
    for (const post of posts) {
      // add item tag to our rss feed with correct data
      feed.item({
        title: post.title, // title from post to item title
        url: `https://dev.to/${post.path}`, // full path to where our article is hosted
        //description: '', // dev.to APIs doesn't return a description, if you have one you can add it here
        date: post.published_at_int, // date post was created
        categories: post.tag_list, // list of tags
      });
    }
    const feedString = feed.xml({ indent: true }); //This returns the XML as a string.

    event.node.res.setHeader('content-type', 'text/xml'); // we need to tell nitro to return this as a xml file
    event.node.res.end(feedString); // send the HTTP response
  } catch (e) {
    // return an error
    return e;
  }
});
