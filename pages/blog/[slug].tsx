import type { NextPage, GetStaticProps, GetStaticPaths } from "next";

import { getPostBySlug, getPostsPaths, getNewestPosts } from "lib/posts";
import { Layout } from "components/layout/Layout";
import { Mdx } from "components/mdx/Mdx";
import type { InferGetStaticPropsType } from "types";
import { Seo } from "components/Seo";
import { FeaturedPosts } from "components/blog/featuredPosts/FeaturedPosts";
import { allCategories } from "data/categories";

const Post: NextPage = ({
  transformedMdx,
  frontmatter,
  newestPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { title, excerpt, publishedAt, image, author, category, slug } = frontmatter;

  return (
    <Layout>
      <Seo
        title={title}
        description={excerpt}
        publishedAt={publishedAt}
        type="article"
        author={author}
        imageUrl={image}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          ...(allCategories.find((c) => c.slug === category)
            ? [{ name: allCategories.find((c) => c.slug === category)!.name, path: `/blog?category=${category}` }]
            : []),
          { name: title, path: `/blog/${slug}` },
        ]}
      />
      <Mdx content={transformedMdx} resource={frontmatter} />
      <FeaturedPosts posts={newestPosts} actualPostSlug={frontmatter.slug} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params!.slug as string;
  const { transformedMdx, frontmatter } = await getPostBySlug(slug);
  const newestPosts = getNewestPosts();

  return {
    props: {
      transformedMdx,
      frontmatter: {
        slug,
        ...frontmatter,
      },
      newestPosts,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = getPostsPaths();

  return {
    paths,
    fallback: false,
  };
};

export default Post;
