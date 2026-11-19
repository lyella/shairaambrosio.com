import algoliasearch from "algoliasearch";
import dayjs from "dayjs";
import invariant from "invariant";

import { getPublishedPosts, getPostParsedContent } from "./lib/posts";
import { getAllProjects, getProjectParsedContent } from "./lib/projects";

const generateAlgoliaProjects = async () => {
  const projects = getAllProjects();

  return await Promise.all(
    projects.map(async (project) => {
      const { compiledContent } = await getProjectParsedContent(project.slug);

      return {
        ...project,
        content: String(compiledContent).replace(/<[^>]+>/g, ""),
        objectID: project.slug,
        timestamp: dayjs(project.publishedAt, "DD-MM-YYYY").unix(),
      };
    }),
  );
};

const generateAlgoliaPosts = async () => {
  const posts = getPublishedPosts();

  return await Promise.all(
    posts.map(async (post) => {
      const { compiledContent } = await getPostParsedContent(post.slug);

      return {
        ...post,
        content: String(compiledContent).replace(/<[^>]+>/g, ""),
        objectID: post.slug,
        timestamp: dayjs(post.publishedAt, "DD-MM-YYYY").unix(),
      };
    }),
  );
};

async function run() {
  invariant(!!process.env.ALGOLIA_UPDATE_API_KEY, "Admin API KEY is not set");

  const client = algoliasearch(process.env.ALGOLIA_APP_ID as string, process.env.ALGOLIA_UPDATE_API_KEY);
  const projectsIndex = client.initIndex("projects");
  const postsIndex = client.initIndex("posts");

  const [projects, posts] = await Promise.all([generateAlgoliaProjects(), generateAlgoliaPosts()]);

  // Replace, don't merge. saveObjects() only upserts, so records added by hand in
  // the Algolia dashboard (objectIDs like "..._dashboard_generated_id") survived
  // every run and the posts index ended up with 12 objects for 6 posts, showing
  // each article twice in search. clearObjects() first makes the local content
  // files the single source of truth.
  await Promise.all([projectsIndex.clearObjects(), postsIndex.clearObjects()]);

  const indexedProjects = await projectsIndex.saveObjects(projects);
  const indexedPosts = await postsIndex.saveObjects(posts);

  console.log(`${indexedProjects.objectIDs.length} projects indexed`);
  console.log(`${indexedPosts.objectIDs.length} posts indexed`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
