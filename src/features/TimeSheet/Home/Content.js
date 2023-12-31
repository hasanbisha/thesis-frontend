import { useMemo, useCallback, useContext } from "react";
import useSWR from "swr";
import moment from "moment";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Table from "./Table";
import Overall from "./Overall";
import DateRange from "../DateRange";
import { useColumns } from "./Table/useColumns";
import { useFiltersColumns } from "./Table/useFiltersColumns";
import { useTableState, useTableStateQueryParams } from "../hooks";
import { useTable } from "../../../components/Table/hook";
import Header from "../../../components/Layout/Header";
import { useVisible } from "../../../utils/hooks/useVisible";
import { DateRangeContext } from "../DateRange/context";

function Content() {
    const { startDate, endDate } = useContext(DateRangeContext);

    const { open, visible, close } = useVisible();

    const openAnalytics = useCallback(() => {
        if (visible) {
            close();
        } else {
            open();
        }
    }, [visible, open, close]);

    const columns = useColumns();
    const filtersColumns = useFiltersColumns();
    const [state, onStateChange] = useTableState();
    const params = useTableStateQueryParams(state);

    const { data, isLoading } = useSWR({
        url: "/timesheets",
        params: {
            ...params,
            from: moment(startDate).unix(),
            to: moment(endDate).unix()
        },
    });

    const tableData = useMemo(() => {
        const dates = Object.keys(data || {});
        const formattedData = dates?.map((date) => ({
            date,
            job: data[date][0].job,
            location: data[date][0]?.location,
            project: data[date][0]?.project,
            values: data[date]
        }));

        return [
            formattedData,
            formattedData?.length
        ]
    }, [data]);

    const table = useTable({
        data: tableData,
        columns,
        isLoading,
        state,
        onStateChange,
        enableRowSelection: false,
        manualRowSelection: false,
        enableExpanding: true,
        manualExpanding: true,
        getRowCanExpand: () => true,
    });

    return (
        <div className="">
            <Header title="Timesheet">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={openAnalytics}
                    >
                        Analytics

                        {visible
                            ? <ChevronUpIcon className="h-5" />
                            : <ChevronDownIcon className="h-5" />}
                    </button>

                    <div className="ml-5">
                        <DateRange />
                    </div>
                </div>
            </Header>

            {visible && (
                <div className="bg-white">
                    <div className="layout-content">
                        <Overall params={params} />
                    </div>
                </div>
            )}

            <div className="layout-content">
                <Table
                    table={table}
                    hasFilters={true}
                    filtersColumns={filtersColumns}
                />
            </div>
        </div>
    );
}

export default Content;
