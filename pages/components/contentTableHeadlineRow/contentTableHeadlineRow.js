import * as React from "react";
import css from "./contentTableHeadlineRow.scss";

// ToDo: Add the possibility to change projects
const ContentTableHeadlineRow = ({ availableProjects, currentProject, imageSetName }) => {

    return (
        <tr>
            <td colSpan={3} className={css.contentTableHeadlineRow}> <h2>{ imageSetName }</h2> </td>
        </tr>

    )
};

export default ContentTableHeadlineRow;