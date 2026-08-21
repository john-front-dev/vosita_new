export type Category = {
  id: number | string;
  name: string;
};

export type CategoriesResponse = ApiResponse<{
  data?: Category[];
}>;
