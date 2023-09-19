import { Well } from "@beanstalk/sdk/Wells";
import React, { useCallback, useEffect, useState } from "react";
import { FC } from "src/types";
import styled from "styled-components";
import { Row } from "../../Layout";
import { ChevronDown } from "../../Icons";
import { Chart } from "./Chart";
import { TabButton } from "src/components/TabButton";
import useWellChartData from "src/wells/useWellChartData";
import { ChartContainer } from "./ChartStyles";
import { BottomDrawer } from "src/components/BottomDrawer";
import { size } from "src/breakpoints";

function timeToLocal(originalTime: number) {
  const d = new Date(originalTime * 1000);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) / 1000;
}

export const ChartSection: FC<{ well: Well }> = ({ well }) => {
  const [tab, setTab] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timePeriod, setTimePeriod] = useState("week");
  const [dropdownButtonText, setDropdownButtonText] = useState("1 WEEK");

  const { data: chartData, refetch, error, isLoading } = useWellChartData(well, timePeriod);

  const [liquidityData, setLiquidityData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);

  const [isChartTypeDrawerOpen, setChartTypeDrawerOpen] = useState(false);
  const [isChartRangeDrawerOpen, setChartRangeDrawerOpen] = useState(false);

  useEffect(() => {
    if (!chartData) return;
    let _liquidityData: any = [];
    let _volumeData: any = [];
    for (let i = 0; i < chartData.length; i++) {
      _liquidityData.push({
        time: timeToLocal(Number(chartData[i].lastUpdateTimestamp)),
        value: Number(chartData[i].totalLiquidityUSD).toFixed(2)
      });
      _volumeData.push({
        time: timeToLocal(Number(chartData[i].lastUpdateTimestamp)),
        value: Number(chartData[i].deltaVolumeUSD).toFixed(2)
      });
    }
    setLiquidityData([..._liquidityData]);
    setVolumeData([..._volumeData]);
  }, [chartData]);

  useEffect(() => {
    refetch();
  }, [timePeriod, refetch]);

  const showTab = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>, i: number) => {
    (e.target as HTMLElement).blur();
    setTab(i);
  }, []);

  function setChartRange(range: string) {
    setShowDropdown(false);
    setTimePeriod(range);
    if (range === "day") {
      setDropdownButtonText("1 DAY");
    } else if (range === "week") {
      setDropdownButtonText("1 WEEK");
    } else if (range === "month") {
      setDropdownButtonText("1 MONTH");
    } else {
      setDropdownButtonText("ALL");
    }
  }

  return (
    <Container id="chart-section">
      <DesktopRow>
        <TabButton onClick={(e) => showTab(e, 0)} active={tab === 0} hover>
          LIQUIDITY
        </TabButton>
        <TabButton onClick={(e) => showTab(e, 1)} active={tab === 1} hover>
          VOLUME
        </TabButton>
        <FilterButton
          onClick={() => {
            setShowDropdown(!showDropdown);
          }}
        >
          {dropdownButtonText} <ChevronDown width={6} />
          <Dropdown enabled={showDropdown}>
            <DropdownItem
              stretch
              hover
              onClick={() => {
                setChartRange("day");
              }}
            >
              1 DAY
            </DropdownItem>
            <DropdownItem
              stretch
              hover
              onClick={() => {
                setChartRange("week");
              }}
            >
              1 WEEK
            </DropdownItem>
            <DropdownItem
              stretch
              hover
              onClick={() => {
                setChartRange("month");
              }}
            >
              1 MONTH
            </DropdownItem>
            <DropdownItem
              stretch
              hover
              onClick={() => {
                setChartRange("all");
              }}
            >
              ALL
            </DropdownItem>
          </Dropdown>
        </FilterButton>
      </DesktopRow>
      <MobileRow>
        <TabButton onClick={() => setChartTypeDrawerOpen(true)}>{tab === 0 ? "LIQUIDITY" : "VOLUME"}</TabButton>
        <BottomDrawer showDrawer={isChartTypeDrawerOpen} headerText={"View Chart"} toggleDrawer={setChartTypeDrawerOpen}>
          <DrawerRow
            onClick={() => {
              setTab(0), setChartTypeDrawerOpen(false);
            }}
          >
            LIQUIDITY
          </DrawerRow>
          <DrawerRow
            onClick={() => {
              setTab(1), setChartTypeDrawerOpen(false);
            }}
          >
            VOLUME
          </DrawerRow>
        </BottomDrawer>
        <FilterButton onClick={() => setChartRangeDrawerOpen(true)}>
          {dropdownButtonText} <ChevronDown width={6} />
        </FilterButton>
        <BottomDrawer showDrawer={isChartRangeDrawerOpen} headerText={"Time Period"} toggleDrawer={setChartRangeDrawerOpen}>
          <DrawerRow
            onClick={() => {
              setChartRange("day"), setChartRangeDrawerOpen(false);
            }}
          >
            DAY
          </DrawerRow>
          <DrawerRow
            onClick={() => {
              setChartRange("week"), setChartRangeDrawerOpen(false);
            }}
          >
            WEEK
          </DrawerRow>
          <DrawerRow
            onClick={() => {
              setChartRange("month"), setChartRangeDrawerOpen(false);
            }}
          >
            MONTH
          </DrawerRow>
          <DrawerRow
            onClick={() => {
              setChartRange("all"), setChartRangeDrawerOpen(false);
            }}
          >
            ALL
          </DrawerRow>
        </BottomDrawer>
      </MobileRow>
      {error !== null && <ChartLoader>{`Error Loading Chart Data :(`}</ChartLoader>}
      {isLoading && <ChartLoader>Loading Chart Data...</ChartLoader>}
      {tab === 0 && !error && !isLoading && <Chart data={liquidityData} legend={"TOTAL LIQUIDITY"} />}
      {tab === 1 && !error && !isLoading && <Chart data={volumeData} legend={"HOURLY VOLUME"} />}
    </Container>
  );
};

const ChartLoader = styled(ChartContainer)`
  justify-content: center;
  align-items: center;
`;

const DesktopRow = styled(Row)`
  @media (max-width: ${size.mobile}) {
    display: none;
  }
`;

const MobileRow = styled(Row)`
  @media (min-width: ${size.mobile}) {
    display: none;
  }
`;

const DrawerRow = styled(Row)`
  background-color: #fff;
  padding: 16px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.32px;
  border-bottom: 0.5px solid #9ca3af;
`;

const Dropdown = styled.div<{ enabled: boolean }>`
  position: absolute;
  top: 49px;
  right: 0px;
  width: 120px;
  visibility: ${(props) => (props.enabled ? "visible" : "hidden")};
  z-index: 100;
  @media (max-width: ${size.mobile}) {
    top: 41px;
  }
`;

const DropdownItem = styled(TabButton)`
  margin-bottom: 0.5px;
  justify-content: right;
  background-color: #fff;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  outline: 0.5px solid #9ca3af;
  outline-offset: -0.5px;
  background-color: #f9f8f6;
`;

const FilterButton = styled.div`
  display: flex;
  flex-direction: row;
  height: 48px;
  border: none;
  box-sizing: border-box;
  align-items: center;
  margin-left: auto;
  gap: 10px;
  padding: 16px 16px;
  background-color: #fff;
  position: relative;
  outline: 0.5px solid #9ca3af;
  outline-offset: -0.5px;
  cursor: pointer;
  :hover {
    background-color: #f0fdf4;
  }
  @media (max-width: ${size.mobile}) {
    height: 40px;
  }
`;
