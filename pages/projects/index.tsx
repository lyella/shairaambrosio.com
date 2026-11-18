import type { GetStaticProps, NextPage } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { getPlaiceholder } from "plaiceholder";

import { Hero } from "components/common/hero/Hero";
import { Layout } from "components/layout/Layout";
import { ProjectsListing } from "components/projects/projectsListing/ProjectsListing";
import { Seo } from "components/Seo";
import { getBestProjects } from "lib/projects";
import type { InferGetStaticPropsType } from "types";

const Projects: NextPage = ({ projects, blurImageData }: InferGetStaticPropsType<GetStaticProps>) => {
  const description = "Everything that I have built, alone or with someone 🔨";

  return (
    <Layout>
      <Seo title="Projects" description={description} imageUrl={"/img/projects.png"} />
      <Hero title="Projects" description={description} />
      <ProjectsListing projects={projects} blurImageData={blurImageData} />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const projects = getBestProjects();

    const blurImageData = await Promise.all(
      projects.map(async ({ image, slug }) => {
        try {
          const buffer = await readFile(path.join(process.cwd(), "public", image));
          const { base64 } = await getPlaiceholder(buffer);

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
        projects,
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
