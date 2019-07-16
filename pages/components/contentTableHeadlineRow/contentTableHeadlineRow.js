import * as React from "react";
import css from "./contentTableHeadlineRow.scss";

const ContentTableHeadlineRow = ({ availableProjects, currentProject, imageSetName }) => {
    return (
        <tr>
            <td colSpan={3}>{ imageSetName }</td>
        </tr>

    )
};

export default ContentTableHeadlineRow;