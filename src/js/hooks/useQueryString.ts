export type QueryParamsRecord = Record<string, string>;

export type SetQueryParamFunc = (parameter: string, value: string) => void;

export type UseQueryParamFunc = () => [QueryParamsRecord, SetQueryParamFunc];

const setQueryParam: SetQueryParamFunc = (parameter, value) => {
  const parsedUrl = new URL(window.location.href);
  const parsedQueryParams = new URLSearchParams(window.location.search);

  // Set new or modify existing parameter value.
  parsedQueryParams.set(parameter, value);

  parsedUrl.search = '?' + parsedQueryParams.toString();

  // Replace current querystring with the new one.
  history.replaceState(null, '', parsedUrl.toString());
};

export const getQueryString: UseQueryParamFunc = () => {
  // Construct URLSearchParams object instance from current URL querystring.
  const parsedQueryParams = new URLSearchParams(window.location.search);

  const queryParams: Record<string, string> = {};

  for (const [key, value] of parsedQueryParams.entries()) {
    if (
      Object.prototype.hasOwnProperty.call(queryParams, key) ||
      !(key in queryParams)
    ) {
      queryParams[key] = value;
    }
  }

  return [queryParams, setQueryParam];
};
