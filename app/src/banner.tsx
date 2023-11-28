import React, { useState } from "react";
import Select from "react-select";
import { useRecoilState, useRecoilValue } from "recoil";
import { BANNER_TYPES, POSITION_ID, updateBanner, VISIBLE_ON } from "./App";
import { chainIdsToSupportedChain, CHAIN_IDS, CHAIN_NAMES } from "./constant";
import "./styles.css";
import { BannerAD, BannerADType, BannerData } from "./types";
import { generateUniqueId, updateArrayPosition } from "./utils";

// Reusable button component
const Button: React.FC<{
  onClick: () => void;
  style: React.CSSProperties;
  children: React.ReactNode;
}> = ({ onClick, style, children }) => (
  <button style={style} onClick={onClick}>
    {children}
  </button>
);

// Reusable column layout component
function ColumnLayout({ children, ...rest }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "auto",
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Reusable row layout component
function RowLayout({
  children,
  justifyContent,
  ...rest
}: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className="row"
      style={{ display: "flex", gap: "0.5rem", justifyContent: justifyContent }}
      {...rest}
    >
      {children}
    </div>
  );
}

function LabeledTextInput({ label, id, placeholder, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        position: "relative",
        width: "100%",
      }}
    >
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        style={{
          border: "1px solid #ccc",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          width: "90%", // Set the width of the container to 100%
        }}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function LabeledTextarea({ label, id, placeholder, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "auto",
      }}
    >
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        placeholder={placeholder}
        style={{
          border: "1px solid #ccc",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          width: "15rem",
        }}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
function LabeledDateTimeInput({ label, id, value, onChange }) {
  const currentDate = new Date();
  const inputDate = new Date(value);

  const isDateInvalid = inputDate < currentDate;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <label htmlFor={id}>{label}</label>
      <input
        type="datetime-local"
        id={id}
        style={{
          border: `1px solid ${isDateInvalid ? "red" : "green"}`,
          color: `${isDateInvalid ? "red" : "green"}`,
          padding: "0.5rem",
          borderRadius: "0.25rem",
          width: "auto",
        }}
        value={new Date(value).toISOString().slice(0, 16)}
        onChange={onChange}
      />
    </div>
  );
}

function LabeledSelect({
  label,
  id,
  options,
  value,
  onChange,
  multiple = false,
}) {
  const formattedOptions = options.map((option) => ({
    value: option,
    label: option,
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div>
        <Select
          id={id}
          isMulti={multiple} // Enable multi-selection
          options={formattedOptions}
          value={{ value, label: value }}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function LabeledFileInput({ label, id, value, onChange, imageUrl }) {
  const handleClickImage = () => {
    if (imageUrl) {
      window.open(imageUrl, "_blank"); // Open a new tab or window with the provided URL
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div
        style={{
          border: "2px dashed #ccc",
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1rem",
          cursor: imageUrl ? "pointer" : "default", // Set cursor to pointer if an image is present
        }}
        onClick={handleClickImage}
      >
        {value ? (
          <img
            src={value}
            alt="Uploaded Banner"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <span style={{ color: "#888" }}>Upload Banner Image</span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        style={{ display: "none", maxWidth: "100%" }}
        id={id}
      />
      <label
        htmlFor={id}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "blue",
          color: "white",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
      >
        Choose Image
      </label>
    </div>
  );
}

function BannerForm({
  bannerData,
  chainId,
  index,
  onUp,
  onDown,
  onDelete,
  onUpdate,
  handleImageChange,
}: {
  bannerData: BannerAD;
  chainId: string;
  index: number;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  onUpdate: (banner: BannerAD) => void;
  handleImageChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<string>;
}) {
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  const toggleMobileConfig = () => {
    setShowMobileConfig((prev) => !prev);
  };
  const data = showMobileConfig
    ? { ...bannerData, ...bannerData.mobile_config }
    : bannerData;

  const updateField = (fieldName: string, value: any) => {
    let newBanner: BannerAD;

    if (showMobileConfig) {
      // If showMobileConfig is true, update the mobile_config field
      newBanner = {
        ...bannerData,
        mobile_config: {
          ...bannerData.mobile_config,
          [fieldName]: value,
        },
      };
    } else {
      // If showMobileConfig is false, update only the specified field
      newBanner = {
        ...bannerData,
        [fieldName]: value,
      };
    }

    onUpdate(newBanner);
  };

  return (
    <div
      style={{
        padding: "1rem",
        paddingBottom: "1rem",
        marginBottom: "3rem",
        borderRadius: "0.5rem",
        background: showMobileConfig
          ? "linear-gradient(to right, #50c9c3, #96deda)"
          : "linear-gradient(to right, #dae2f8, #d6a4a4)",
      }}
    >
      <RowLayout>
        {/* Left Column */}
        <ColumnLayout>
          <LabeledTextInput
            label="Banner ID"
            id="bannerIdInput"
            placeholder="Banner ID"
            value={data.id}
            onChange={(e) => updateField("id", e.target.value)}
          />
          {/* Upload Banner Image */}
          <LabeledFileInput
            label={"Banner Image: " + data?.image_url}
            id="bannerImageInput"
            value={data.image_url}
            imageUrl={data.redirect_url}
            onChange={async (e) => {
              const newUrl = await handleImageChange(e);
              if (newUrl) updateField("image_url", newUrl);
            }}
          />
          {/* Banner ID, Title, Description */}
        </ColumnLayout>
        <ColumnLayout>
          <RowLayout>
            <Button
              onClick={toggleMobileConfig}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: showMobileConfig ? "green" : "pink",
                color: showMobileConfig ? "white" : "#333",
                borderRadius: "0.25rem",
              }}
            >
              {showMobileConfig ? "Hide Mobile Config" : "Show Mobile Config"}
            </Button>
          </RowLayout>
          <LabeledTextInput
            label="Title"
            id="titleInput"
            placeholder="Title"
            value={data.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <LabeledTextarea
            label="Description"
            id="descriptionInput"
            placeholder="Description"
            value={data.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          <LabeledSelect
            label="Position ID"
            id="bannerTypeDropdown"
            options={POSITION_ID}
            value={data.position_id}
            onChange={(e) => console.log(e)}
          />
        </ColumnLayout>
        <ColumnLayout>
          <RowLayout>
            INDEX: {index}
            <Button
              onClick={onUp}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: showMobileConfig ? "green" : "pink",
                color: showMobileConfig ? "white" : "#333",
                borderRadius: "0.25rem",
              }}
            >
              UP
            </Button>
            <Button
              onClick={onDown}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: showMobileConfig ? "green" : "pink",
                color: showMobileConfig ? "white" : "#333",
                borderRadius: "0.25rem",
              }}
            >
              DOWN
            </Button>
            <Button
              onClick={onDelete}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "red",
                color: "white",
                borderRadius: "0.25rem",
              }}
            >
              DELETE
            </Button>
          </RowLayout>

          {/* Date Selector */}
          <RowLayout>
            <LabeledDateTimeInput
              label="Start Date"
              id="startDateInput"
              value={data.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
            />
            <LabeledDateTimeInput
              label="End Date"
              id="endDateInput"
              value={data.end_date}
              onChange={(e) => updateField("end_date", e.target.value)}
            />
          </RowLayout>

          {/* Dropdowns and Input for Banner Details */}
          {/* Assuming BANNER_TYPES is an array of options */}
          <LabeledSelect
            label="Chain ID"
            id="bannerTypeInput"
            options={CHAIN_IDS}
            value={chainId}
            onChange={(e) => console.log(e)}
          />
          <LabeledSelect
            label="Banner Type"
            id="bannerTypeDropdown"
            options={BANNER_TYPES}
            value={data.banner_type}
            onChange={(e) => updateField("banner_type", e.value)}
          />

          <LabeledSelect
            label="Visible On"
            id="bannerVisibleOnDropdown"
            options={VISIBLE_ON}
            value={data.visibleOn}
            onChange={(e) => updateField("visibleOn", e.value)}
          />
          <LabeledTextInput
            label="Redirect URL"
            id="redirectUrlInput"
            placeholder="Redirect URL"
            value={data.redirect_url}
            onChange={(e) => updateField("redirect_url", e.target.value)}
          />
        </ColumnLayout>
      </RowLayout>
    </div>
  );
}

// Replace YourDataType with the type of your JSON data

// Main component
function BannerManagement({ data }: { data: BannerData }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"banners" | "notifications">(
    "banners",
  );
  const [activeChain, setActiveChain] = useState<{
    value: string;
    label: string;
  }>({
    value: "ALL_CHAIN_BANNERS",
    label: "ALL_CHAIN_BANNERS",
  });

  const [bannerData, setBannerData] = useRecoilState(updateBanner);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<string> => {
    const files = event.target.files;

    if (files && files.length > 0) {
      setImageFile(files[0]);
      return "https://assets.leapwallet.io/banner/images/" + files[0].name;
    }
    return "";
  };

  const handleAddBanner = () => {
    const newBanner: BannerAD = {
      id: generateUniqueId(), // You need to implement or import a function to generate a unique ID
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      description: "Get started ->",
      title: "Leap!",
      banner_type: "redirect-external",
      redirect_url: "",
      image_url: "https://assets.leapwallet.io/banner/images/BNI-Leapboad.png",
      position_id: "leap_wallet_home",
      mobile_config: {
        position_id: "leap_mobile_wallet_home",
        image_url:
          "https://assets.leapwallet.io/banner/images/BNI-Leapboad.png",
        redirect_url: "",
      },
      visibleOn: "ALL",
      // Add other default values for the new banner
      // ...
    };

    const updatedData = { ...bannerData };
    const bannersForChain = updatedData[activeChain.value];
    if (bannersForChain)
      updatedData[activeChain.value] = [newBanner, ...bannersForChain];
    else updatedData[activeChain.value] = [newBanner];
    setBannerData(updatedData);
  };

  const handleTabSwitch = (tab: "banners" | "notifications") => {
    setActiveTab(tab);
  };

  const downloadJson = () => {
    // Your TypeScript object
    const tsObject = bannerData;

    // Convert the TypeScript object to a JSON-formatted string
    const jsonString = JSON.stringify(tsObject, null, 2);

    // Create a Blob with the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a download link
    const downloadLink = document.createElement("a");

    // Set the download link attributes
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "banner-v2.json";

    // Append the download link to the body (you can hide it if you want)
    document.body.appendChild(downloadLink);

    // Simulate a click on the download link
    downloadLink.click();

    // Remove the download link from the body
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ margin: "auto", padding: "1rem" }}>
      <RowLayout justifyContent={"space-between"}>
        <div>
          <Button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: activeTab === "banners" ? "blue" : "#ccc",
              color: activeTab === "banners" ? "white" : "#333",
              borderRadius: "0.25rem",
              justifyContent: "space-between",
            }}
            onClick={() => handleTabSwitch("banners")}
          >
            Banners
          </Button>
          <Button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: activeTab === "notifications" ? "blue" : "#ccc",
              color: activeTab === "notifications" ? "white" : "#333",
              borderRadius: "0.25rem",
            }}
            onClick={() => handleTabSwitch("notifications")}
          >
            Notifications
          </Button>
        </div>
        {/* Dropdown to select chain */}

        <LabeledSelect
          label="Chain"
          id="chainSelection"
          options={CHAIN_IDS}
          value={activeChain?.value}
          onChange={(e) => {
            setActiveChain(e);
          }}
        />
        <Button
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "yellowgreen",
            color: "white",
            borderRadius: "0.25rem",
          }}
          onClick={downloadJson}
        >
          Download JSON
        </Button>
      </RowLayout>

      {/* Add new Banner Button */}
      <Button
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "green",
          color: "white",
          margin: "1rem",
          borderRadius: "0.25rem",
        }}
        onClick={handleAddBanner}
      >
        Add new Banner
      </Button>

      {/* Banner Form */}

      {activeTab === "banners" && (
        <>
          {Object.entries(data)
            .filter((obj) => obj[0] === activeChain?.value)
            .map((obj, index) => (
              <React.Fragment key={obj[0]}>
                {obj[1]?.map((banner, index) => (
                  <React.Fragment key={obj[0] + index}>
                    <BannerForm
                      bannerData={banner}
                      chainId={obj[0]}
                      index={index}
                      onUp={() => {
                        let ne = bannerData;
                        const arr = ne[obj[0]];
                        // Create a copy of the array
                        const newArray = updateArrayPosition(
                          arr,
                          index,
                          index - 1,
                        );
                        ne = { ...ne, [obj[0]]: newArray };
                        setBannerData(ne);
                      }}
                      onDown={() => {
                        let ne = bannerData;
                        const arr = ne[obj[0]];
                        // Create a copy of the array
                        const newArray = updateArrayPosition(
                          arr,
                          index,
                          index + 1,
                        );
                        ne = { ...ne, [obj[0]]: newArray };
                        setBannerData(ne);
                      }}
                      onDelete={() => {
                        let ne = bannerData;
                        const arr = [...ne[obj[0]]];
                        arr.splice(index, 1);
                        ne = { ...ne, [obj[0]]: arr };
                        setBannerData(ne);
                      }}
                      onUpdate={(bn) => {
                        let ne = bannerData;
                        const arr = ne[obj[0]];
                        // Create a copy of the array
                        const newArray = [...arr];
                        // Remove the element from the original position
                        const [movedElement] = newArray.splice(index, 1);
                        // Insert the element at the new position
                        newArray.splice(index, 0, bn);
                        ne = { ...ne, [obj[0]]: newArray };
                        setBannerData(ne);
                      }}
                      imageFile={imageFile}
                      handleImageChange={handleImageChange}
                    />
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
        </>
      )}

      {activeTab === "notifications" && (
        <div>
          {/* Content for the 'Notifications' tab goes here. */}
          <p>Content for the 'Notifications' tab goes here.</p>
        </div>
      )}
    </div>
  );
}

function RenderBanners({ data }: { data: Record<string, any> }) {
  return <BannerManagement data={data} />;
}

export default RenderBanners;
