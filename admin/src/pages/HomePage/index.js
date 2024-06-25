import React, { useEffect, useState } from "react";
import { useParams, useHistory } from 'react-router-dom';
import DataTable from "react-data-table-component";
import { useFetchClient, useQueryParams } from "@strapi/helper-plugin";

import {
  Box,
  ContentLayout,
  Button,
  HeaderLayout,
  Layout,
  Combobox,
  ComboboxOption,
  Stack,
  Typography,
  Flex,
} from "@strapi/design-system";

import Filter from "../../components/Filter";
import pluginId from "../../pluginId";

const HomePage = () => {
  const baseUrl = process.env.STRAPI_ADMIN_BACKEND_URL;

  const [dropDownData, setDropDownData] = useState([]);

  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [fileName, setFileName] = useState("");

  //data table pagination
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [{query}, setQuery] = useQueryParams();
  
  const params = useParams();
  const history = useHistory();

  const { get } = useFetchClient();
  const [schemaData, setSchemaData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(
          "/excel-export/get/dropdown/values",
        );
        setDropDownData(response.data);
        setSelectedValue(params.id || null);
        if(selectedValue || params.id) {
          fetchUsers(selectedValue || params.id, parseInt(query.page || 1), parseInt(query.limit || 10));
        }
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      }
    };

    fetchData();
  }, [query, params]);

  //data table pagination
  const handleComboboxChange = async (value) => {
    setSelectedValue(value); // Use the callback form to ensure state is updated
    if (value || params.id) {
      history.push(`/plugins/${pluginId}/${value}?page=1`)
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await get(
        "/excel-export/download/excel",
        {
          responseType: "arraybuffer",
          params: {
            uid: selectedValue || params.id,
            filters: query.filters,
          },
        }
      );

      // Create a Blob from the response data and trigger download
      if (response.data) {
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        setFileName(`file-${formattedDate}.xlsx`);

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `file-${formattedDate}.xlsx`;
        link.click();
        setIsSuccessMessage(true);
        // Hide the success message after 3000 milliseconds (3 seconds)
        setTimeout(() => {
          setIsSuccessMessage(false);
        }, 8000);
      }
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  const handleComboBoxClear = async () => {
    history.push(`/plugins/${pluginId}`);
    setSelectedValue(null);
    setTableData([]);
  };

  const columnRestructure = columns.map((property) => ({
    name:
      property?.charAt(0).toUpperCase() + property?.slice(1).replace(/_/g, " "),
    selector: (row) => row[property],
  }));

  // Function to format date as "DD-MM-YYYY-HH-mm-ss"
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
  };

  //data table functionality

  const fetchUsers = async (value, page, newPerPage) => {
    setLoading(true);
    const currentSelectedValue = value; // Store the selectedValue in a variable
    if (currentSelectedValue) {
      try {
        {
          const response = await get(
            `/excel-export/get/content-type/schema/${currentSelectedValue}`
          );
          setSchemaData(response.data.schema);
        }
        {
          const offset = (page - 1) * newPerPage; // Calculate the offset based on the current page and items per page
          
          const response = await get(
            `${baseUrl}/excel-export/get/table/data`, {
              params: {
                filters: query.filters,
                uid: value,
                limit: query.limit,
                offset: offset,
              }
            }
          );
          if (response?.data?.columns) {
            setColumns(response.data.columns);
          }
          if (response?.data?.data) {
            setTableData(response.data.data);
            setTotalRows(response.data.count);
          }
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (page, totalRows) => {
    setQuery({ page: page });
  };

  const handlePerRowsChange = async (newPerPage, currentPage) => {
    setQuery({ limit: newPerPage, page: 1 });
  };

  return (
    <Box background="neutral100">
      <Layout>
        <>
          <HeaderLayout title="Excel Download" as="h2" />
          <ContentLayout>
            <Stack>
              <Box padding={4} width="600px">
                <Combobox
                  label="Collection Type"
                  size="M"
                  onChange={handleComboboxChange}
                  value={selectedValue}
                  placeholder="Select collection type"
                  onClear={handleComboBoxClear}
                >
                  {dropDownData?.data?.map((item) => (
                    <ComboboxOption key={item.value} value={item.value}>
                      {item.label}
                    </ComboboxOption>
                  ))}
                </Combobox>
              </Box>
              {selectedValue && (
                <>
                  <Box padding={4} marginTop={2} className="ml-auto">
                  <Flex
                      gap={3}
                    >
                      <Button
                        size="L"
                        variant="default"
                        onClick={handleDownloadExcel}
                      >
                        Download
                      </Button>
                      {schemaData[0]? <Filter schema={schemaData} /> : null}
                    </Flex>
                    <br />
                    {isSuccessMessage && (
                      <Typography
                        style={{
                          color: "green",
                          "font-size": "medium",
                          "font-weight": "500",
                        }}
                      >
                        Download completed: {fileName} successfully downloaded!
                      </Typography>
                    )}
                  </Box>
                  <Box className="ml-auto">
                    <DataTable
                      paginationDefaultPage={parseInt(query.page || 1)}
                      pagination
                      columns={columnRestructure}
                      data={tableData}
                      progressPending={loading}
                      paginationServer
                      paginationTotalRows={totalRows}
                      paginationPerPage={parseInt(query.limit || 10)}
                      onChangeRowsPerPage={handlePerRowsChange}
                      onChangePage={handlePageChange}
                    />
                  </Box>
                </>
              )}
            </Stack>
          </ContentLayout>
        </>
      </Layout>
    </Box>
  );
};

export default HomePage;
