import type { GetStaticProps, NextPage } from "next";
import { getPlaiceholder } from "plaiceholder";

import { Hero } from "components/common/hero/Hero";
import { Layout } from "components/layout/Layout";
import { ProjectsListing } from "components/projects/projectsListing/ProjectsListing";
import { Seo } from "components/Seo";
import { getAllProjects } from "lib/projects";
import type { InferGetStaticPropsType } from "types";

const Projects: NextPage = ({ blurImageData }: InferGetStaticPropsType<GetStaticProps>) => {
  const description = "Everything that I have built, alone or with someone 🔨";

  return (
    <Layout>
      <Seo title="Projects" description={description} imageUrl={"/img/projects.png"} />
      <Hero title="Projects" description={description} />
      <ProjectsListing blurImageData={blurImageData} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const projects = getAllProjects();

    const blurImageData = await Promise.all(
      projects.map(async ({ image, slug }) => {
        try {
          const { base64 } = await getPlaiceholder(image);

          return {
            slug,
            base64,
          };
        } catch (e) {
          // A missing or unreadable thumbnail should not take the whole page down.
          console.error(`Failed to generate blur for project image: ${image}`, e);

          return {
            slug,
            base64: "",
          };
        }
      }),
    );

    return {
      props: {
        blurImageData,
      },
    };
  } catch (e) {
    console.error(e);

    return {
      notFound: true as const,
    };
  }
};

export default Projects;
