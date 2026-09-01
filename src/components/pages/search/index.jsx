"use client";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import useDebounce from "@/utils/hooks/useDebounce";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiSearchLine } from "react-icons/ri";
import { Container, Input, InputGroup } from "reactstrap";
import SearchedData from "./SearchedData";
const SearchModule = () => {
  const { t } = useTranslation("common");
  const [search] = useCustomSearchParams(["search"]);
  const [searchState, setSearchState] = useState("");
  const debouncedSearch = useDebounce(searchState, 450);
  const router = useRouter();

  const { data, refetch, isLoading, fetchStatus, isError } = useFetchQuery(
    [ProductAPI, "search", debouncedSearch],
    () =>
      request({
        url: ProductAPI,
        params: { search: debouncedSearch.trim(), paginate: 100, status: 1 },
      }),
    {
      enabled: Boolean(debouncedSearch.trim()),
      refetchOnWindowFocus: false,
      select: (response) => response?.data?.data || [],
      onError: (error) => {
        console.error("Error fetching search results", error); // Error handling
      },
    }
  );

  useEffect(() => {
    const nextSearch = search?.search || "";
    setSearchState((currentSearch) => currentSearch === nextSearch ? currentSearch : nextSearch);
  }, [search?.search]);

  // Handle search input change and push to router
  const onHandleSearch = (e) => {
    setSearchState(e.target.value);
    router.replace(`/search?search=${encodeURIComponent(e.target.value)}`);
  };

  return (
    <>
      <Breadcrumbs title={"Search"} subNavigation={[{ name: "Search" }]} />
      <section className="authentication-page section-t-space">
        <Container>
          <div className="row">
            <WrapperComponent classes={{ sectionClass: "search-block", fluidClass: "container", col: "offset-lg-3" }} colProps={{ lg: "6" }}>
              <form className="form-header form-box" onSubmit={(e) => e.preventDefault()}>
                <InputGroup>
                  <Input type="text" className="form-control" placeholder={t("SearchProducts") + "....."} value={searchState} onChange={(e) => onHandleSearch(e)} />
                  <Btn
                    className="btn-solid"
                    onClick={(e) => {
                      e.preventDefault();
                      if (searchState.trim()) refetch();
                    }}
                  >
                    <RiSearchLine />
                    {"  "} {t("Search")}
                  </Btn>
                </InputGroup>
              </form>
            </WrapperComponent>
          </div>
        </Container>
      </section>
      <SearchedData data={data} fetchStatus={fetchStatus} isError={isError} />
    </>
  );
};

export default SearchModule;
