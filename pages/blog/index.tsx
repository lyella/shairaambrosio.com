import type { GetStaticProps, NextPage } from "next";

import { PostsListing } from "components/blog/postsListing/PostsListing";
import { Hero } from "components/common/hero/Hero";
import { Layout } from "components/layout/Layout";
import { Seo } from "components/Seo";
import { getPostsCategories } from "lib/posts";
import { InferGetStaticPropsType } from "types";

const Blog: NextPage = ({ categories }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const description = "All the content created by either myself or one of the authors for my blog.";

  return (
    <Layout>
      <Seo
        title="Blog"
        description={description}
        imageUrl={"/img/blog.png"}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <Hero title="Blog" description={description} />
      <PostsListing categories={categories} popularPosts={[]} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const categories = getPostsCategories();

    return {
      props: {
        categories,
      },
    };
  } catch {
    return {
      notFound: true as const,
    };
  }
};

export default Blog;
