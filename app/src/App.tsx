import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import BannerManagement from "./banner";
import { atom, useRecoilState } from "recoil";
import React from "react";

export const BANNER_TYPES = [
  "redirect-external",
  "redirect-interanlly",
  "popup",
];

export const VISIBLE_ON = ["ALL", "EXTENSION", "MOBILE"];
export const POSITION_ID = ["leap_mobile_wallet_home", "leap_wallet_home"];

export const updateBanner = atom({
  key: "updateBanner",
  default: undefined,
});

const fetchBannerData = async () => {
  const response = await fetch(
    "https://assets.leapwallet.io/banner/banner.json",
  );
  if (!response.ok) {
    throw new Error("Failed to fetch banner data");
  }
  return response.json();
};

export default function App() {
  const { data, isLoading, isError } = useQuery("bannerData", fetchBannerData);
  const [updatableBanner, setUpdateBanner] = useRecoilState(updateBanner);

  useEffect(() => {
    if (!updatableBanner) setUpdateBanner(data);
  }, [data]);

  if (isLoading || !updatableBanner) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="App">
      <BannerManagement data={updatableBanner} />
    </div>
  );
}
