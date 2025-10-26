/* eslint-disable import/order */
import { Layout } from "components/layout/Layout";
import type { GetStaticProps, NextPage } from "next";
// import { SpotifyTile } from "components/tile/spotifyTile/SpotifyTile";
import { ProjectTile } from "components/projects/projectTile/ProjectTile";
import { AboutTile } from "components/tile/aboutTile/AboutTile";
import { SocialTile } from "components/tile/socialTile/SocialTile";
// import { ThemeTile } from "components/tile/themeTile/themeTile";
import ClockTile from "components/tile/clockTile/ClockTile";
import { LatestPostTile } from "components/tile/latestPostTile/LatestPostTile";
// import { NewsletterTile } from "components/tile/newsletterTile/NewsletterTile";
import { Grid } from "components/common/grid/Grid";
import { AvatarTile } from "components/tile/avatarTile/AvatarTile";
import { ContactTile } from "components/tile/contactTile/ContactTile";
import { getNewestPosts } from "lib/posts";
import { getBestProjects } from "lib/projects";
import type { InferGetStaticPropsType } from "types";

const Home: NextPage = ({ projects, posts }: InferGetStaticPropsType<GetStaticProps>) => {
  return (
    <Layout>
      <Grid>
        {/* <SpotifyTile /> */}
        <AvatarTile />
        <AboutTile />
        <ClockTile />
        {/* <ThemeTile /> */}
        <ProjectTile project={projects[0]} mockupPosition="right" />
        <SocialTile social="x" />
        <LatestPostTile post={posts[0]} />
        <ProjectTile project={projects[1]} mockupPosition="left" />
        <SocialTile social="github" />
        <SocialTile social="linkedin" />
        {/* <NewsletterTile /> */}
        <ContactTile />
      </Grid>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = () => {
  const bestProjects = getBestProjects();
  const newestPosts = getNewestPosts();

  return {
    props: {
      projects: bestProjects,
      posts: newestPosts,
    },
    revalidate: 10,
  };
};

export default Home;
