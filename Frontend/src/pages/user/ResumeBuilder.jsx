import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./ResumeBuilder.css";

function ResumeBuilder() {
  const [basicInfo, setBasicInfo] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
  });

  const [sections, setSections] = useState([
    {
      id: "s1",
      title: "Professional Summary",
      content:
        "A passionate software developer with 3+ years of experience building scalable web applications. Proven ability to optimize systems and lead cross-functional teams.",
    },
    {
      id: "s2",
      title: "Experience",
      content:
        "Software Engineer | Tech Corp | 2020 - Present\n- Developed scalable web applications using React and Node.js\n- Improved API response times by 30%\n- Mentored junior engineers and led code reviews",
    },
    {
      id: "s3",
      title: "Education",
      content:
        "B.S. Computer Science | University of Technology | 2016 - 2020\n- Graduated with Honors (GPA: 3.8/4.0)\n- Relevant coursework: Data Structures, Algorithms, Web Development",
    },
    {
      id: "s4",
      title: "Skills",
      content:
        "- Programming: JavaScript, Python, Java\n- Frameworks: React, Express.js, Next.js\n- Tools: Git, Docker, AWS",
    },
  ]);

  const [previewScale, setPreviewScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const resumeRef = useRef(null);
  const shellRef = useRef(null);
  const scaleBoxRef = useRef(null);

  const parseMultilineText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    const parsed = [];
    let currentList = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        currentList.push(
          <li key={`li-${index}`}>{trimmed.substring(2)}</li>
        );
      } else {
        if (currentList.length > 0) {
          parsed.push(<ul key={`ul-${index}`}>{currentList}</ul>);
          currentList = [];
        }
        if (trimmed !== "") {
          const isEmphasis = index === 0 || trimmed.includes("|");
          parsed.push(
            <p
              key={`p-${index}`}
              className={isEmphasis ? "resume-line--emphasis" : undefined}
            >
              {trimmed}
            </p>
          );
        }
      }
    });

    if (currentList.length > 0) {
      parsed.push(<ul key="ul-end">{currentList}</ul>);
    }

    return parsed;
  };

  const updatePreviewScale = useCallback(() => {
    const shell = shellRef.current;
    const page = resumeRef.current;
    const scaleBox = scaleBoxRef.current;
    if (!shell || !page || !scaleBox) return;

    page.style.transform = "translateX(-50%)";
    page.style.left = "50%";

    const pageWidth = page.offsetWidth;
    const pageHeight = page.offsetHeight;
    const available = shell.clientWidth;
    const scale = Math.min(1, Math.max(0.25, (available - 4) / pageWidth));

    page.style.transform = `translateX(-50%) scale(${scale})`;
    scaleBox.style.width = `${pageWidth * scale}px`;
    scaleBox.style.height = `${pageHeight * scale}px`;
    scaleBox.style.marginLeft = "auto";
    scaleBox.style.marginRight = "auto";
    setPreviewScale(scale);
  }, []);

  useEffect(() => {
    updatePreviewScale();

    const shell = shellRef.current;
    if (!shell) return undefined;

    const observer = new ResizeObserver(() => updatePreviewScale());
    observer.observe(shell);
    window.addEventListener("resize", updatePreviewScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePreviewScale);
    };
  }, [updatePreviewScale, sections, basicInfo]);

  const handleBasicChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (id, field, value) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      { id: Date.now().toString(), title: "New Section", content: "" },
    ]);
  };

  const handleRemoveSection = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleMoveSection = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === sections.length - 1) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    setSections(newSections);
  };

  const handleDownloadPdf = async () => {
    const element = resumeRef.current;
    const scaleBox = scaleBoxRef.current;
    if (!element) return;

    setIsExporting(true);

    const prevTransform = element.style.transform;
    const prevBorder = element.style.border;
    const prevShadow = element.style.boxShadow;
    const prevScaleBoxWidth = scaleBox?.style.width;
    const prevScaleBoxHeight = scaleBox?.style.height;

    element.style.transform = "none";
    element.style.left = "0";
    element.style.position = "relative";
    element.style.border = "none";
    element.style.boxShadow = "none";
    if (scaleBox) {
      scaleBox.style.width = "auto";
      scaleBox.style.height = "auto";
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("resume.pdf");
    } finally {
      element.style.position = "";
      element.style.left = "";
      element.style.transform = prevTransform;
      element.style.border = prevBorder;
      element.style.boxShadow = prevShadow;
      if (scaleBox) {
        scaleBox.style.width = prevScaleBoxWidth || "";
        scaleBox.style.height = prevScaleBoxHeight || "";
      }
      setIsExporting(false);
      requestAnimationFrame(updatePreviewScale);
    }
  };

  return (
    <div className="resume-builder">
      <aside className="resume-editor">
        <h2>Resume Builder</h2>
        <div className="resume-editor-form">
          <h3>Basic Info</h3>
          <input
            type="text"
            name="name"
            className="resume-input"
            value={basicInfo.name}
            onChange={handleBasicChange}
            placeholder="Full Name"
          />
          <input
            type="email"
            name="email"
            className="resume-input"
            value={basicInfo.email}
            onChange={handleBasicChange}
            placeholder="Email"
          />
          <input
            type="text"
            name="phone"
            className="resume-input"
            value={basicInfo.phone}
            onChange={handleBasicChange}
            placeholder="Phone"
          />

          <h3>Sections</h3>

          {sections.map((section, index) => (
            <div key={section.id} className="resume-section-card">
              <div className="resume-section-toolbar">
                <input
                  type="text"
                  className="resume-input resume-input--bg"
                  value={section.title}
                  onChange={(e) =>
                    handleSectionChange(section.id, "title", e.target.value)
                  }
                  placeholder="Section Title"
                />
                <button
                  type="button"
                  className="resume-icon-btn"
                  onClick={() => handleMoveSection(index, -1)}
                  disabled={index === 0}
                  aria-label="Move section up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="resume-icon-btn"
                  onClick={() => handleMoveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  aria-label="Move section down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="resume-icon-btn resume-icon-btn--danger"
                  onClick={() => handleRemoveSection(section.id)}
                  aria-label="Remove section"
                >
                  🗑
                </button>
              </div>
              <textarea
                className="resume-input resume-input--bg resume-textarea"
                value={section.content}
                onChange={(e) =>
                  handleSectionChange(section.id, "content", e.target.value)
                }
                placeholder="Section Content (Use dashes for bullets)"
              />
            </div>
          ))}

          <button
            type="button"
            className="resume-add-section-btn"
            onClick={handleAddSection}
          >
            + Add Custom Section
          </button>

          <button
            type="button"
            className="counter resume-download-btn"
            onClick={handleDownloadPdf}
            disabled={isExporting}
          >
            {isExporting ? "Generating PDF…" : "Download PDF"}
          </button>
        </div>
      </aside>

      <section className="resume-preview-column">
        <p className="resume-preview-label">
          Preview — scales to fit your screen; PDF downloads at full A4 size
          {previewScale < 1 && ` (${Math.round(previewScale * 100)}%)`}
        </p>
        <div className="resume-preview-shell" ref={shellRef}>
          <div className="resume-scale-box" ref={scaleBoxRef}>
            <div
              ref={resumeRef}
              className={`resume-page${isExporting ? " resume-page--exporting" : ""}`}
            >
              <header className="resume-header">
                <h1 className="resume-name">
                  {basicInfo.name || "Your Name"}
                </h1>
                <div className="resume-contact">
                  <span>{basicInfo.email}</span>
                  <span className="resume-contact-sep" aria-hidden="true">
                    |
                  </span>
                  <span>{basicInfo.phone}</span>
                </div>
              </header>

              {sections.map((section) => {
                if (!section.title && !section.content) return null;
                return (
                  <section key={section.id} className="resume-block">
                    <h3 className="resume-block-title">{section.title}</h3>
                    <div className="resume-block-body">
                      {parseMultilineText(section.content)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResumeBuilder;
