import type { GetStaticProps, NextPage } from "next";

import { Layout } from "components/layout/Layout";
import { Mdx } from "components/mdx/Mdx";
import { Seo } from "components/Seo";
import { getProjectBySlug, getProjectsPaths } from "lib/projects";
import type { InferGetStaticPropsType } from "types";

const Project: NextPage = ({ transformedMdx, frontmatter }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { title, excerpt, publishedAt, image, author } = frontmatter;

  return (
    <Layout>
      <Seo
        title={title}
        description={excerpt}
        imageUrl={image}
        publishedAt={publishedAt}
        type="article"
        author={author}
      />
      <Mdx resource={frontmatter} content={transformedMdx} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params!.slug as string;
  const { transformedMdx, frontmatter } = await getProjectBySlug(slug);

  return {
    props: {
      transformedMdx,
      frontmatter: {
        slug,
        ...frontmatter,
      },
    },
    revalidate: 10,
  };
};

export const getStaticPaths = () => {
  const paths = getProjectsPaths();

  return {
    paths,
    fallback: false,
  };
};

export default Project;
