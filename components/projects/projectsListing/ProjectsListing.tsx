import algoliasearch from "algoliasearch";

import dynamic from "next/dynamic";

import { memo, useCallback, useMemo, useState } from "react";

import { InstantSearch, useInstantSearch, useSearchBox } from "react-instantsearch";

import ReactPaginate from "react-paginate";

import { useMounted } from "hooks/useMounted";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

import { LoaderRing } from "components/common/loader/LoaderRing";

import { SearchBox } from "components/common/searchBox/SearchBox";

import { ProjectThumbnail } from "components/projects/projectsListing/projectThumbnail/ProjectThumbnail";

import type { Project } from "types";

import thinking from "../../../public/lottie/thinking.json";

import styles from "./projectsListing.module.scss";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
);

const searchThinking = {
  loop: true,
  autoplay: true,
  animationData: thinking,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

interface CustomHitsProps {
  readonly currentObjectID: string | null;
  readonly projects: Project[];
  readonly blurImageData: {
    readonly slug: string;
    readonly base64: string;
  }[];
}

export const CustomHits = ({ currentObjectID, projects, blurImageData }: CustomHitsProps) => {
  const { query } = useSearchBox();

  const isMounted = useMounted();
  const [currentPage, setCurrentPage] = useState(0);
  const HITS_PER_PAGE = 10;

  // Source of truth is the statically generated project list; the query from
  // the search box filters it locally, so the listing never depends on a
  // stale Algolia index.
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return projects;

    return projects.filter((project) =>
      [project.title, project.excerpt, ...(project.stack ?? [])].join(" ").toLowerCase().includes(q),
    );
  }, [projects, query]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  if (!hits.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.avatar}>{isMounted && <Lottie options={searchThinking} height={300} />}</div>
      </div>
    );
  }

  const startIndex = currentPage * HITS_PER_PAGE;
  const endIndex = startIndex + HITS_PER_PAGE;
  const currentHits = hits.slice(startIndex, endIndex);

  return (
    <>
      <ol id="search-hits-list" className={styles.list}>
        {currentHits.map((project) => (
          <li
            key={project.slug}
            role="option"
            aria-describedby="search-details"
            aria-selected={currentObjectID === project.slug ? "true" : "false"}
            id={"id" + project.slug}
            className={styles.hit}
          >
            <ProjectThumbnail
              project={project}
              blurDataURL={blurImageData.find((d) => d.slug === project.slug)?.base64}
            />
          </li>
        ))}
      </ol>
      <ReactPaginate
        pageCount={Math.ceil(hits.length / HITS_PER_PAGE)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={styles.pagination}
        activeClassName={styles.active}
      />
    </>
  );
};

const LoadingIndicator = () => {
  const { status } = useInstantSearch();

  return status === "stalled" ? (
    <div className={styles.loading}>
      <LoaderRing />
    </div>
  ) : null;
};

interface ProjectsListingProps {
  readonly projects: Project[];
  readonly blurImageData: {
    readonly slug: string;
    readonly base64: string;
  }[];
}

export const ProjectsListing = memo<ProjectsListingProps>(({ projects, blurImageData }) => {
  const [currentObjectID, setObjectId] = useState<string | null>(null);

  const handleInputChange = useCallback(() => {
    setTimeout(() => setObjectId(null), 0);
  }, []);

  return (
    <div className={styles.projects}>
      <InstantSearch indexName="projects" searchClient={searchClient}>
        <SearchBox currentObjectID={currentObjectID} onChange={handleInputChange} />
        <LoadingIndicator />
        <CustomHits currentObjectID={currentObjectID} projects={projects} blurImageData={blurImageData} />
      </InstantSearch>
    </div>
  );
});

ProjectsListing.displayName = "ProjectsListing";
