import { useState } from "react";
import SectionWrapper from "./SectionWrapper";

const Contact = () => {
  const [form, setForm] = useState({ name: "", org: "", message: "" });

  const inputClass =
    "w-full rounded-lg bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground neon-border outline-none transition-all duration-300 focus:border-primary/60 focus:neon-box-glow";

  return (
    <SectionWrapper id="contact">
      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        Get in <span className="text-primary">Touch</span>
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
        Interested in deploying Chase-Trace for your organization? Reach out.
      </p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto grid max-w-2xl gap-5"
      >
        <input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
        <input
          placeholder="Organization"
          value={form.org}
          onChange={(e) => setForm({ ...form, org: e.target.value })}
          className={inputClass}
        />
        <label className={`${inputClass} cursor-pointer flex items-center gap-3`}>
          <span className="text-muted-foreground text-sm">Upload CSV</span>
          <input type="file" accept=".csv" className="hidden" />
        </label>
        <textarea
          placeholder="Message"
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
        />
        <button
          type="submit"
          className="gradient-primary rounded-lg py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] neon-box-glow"
        >
          Send Message
        </button>
      </form>
    </SectionWrapper>
  );
};

export default Contact;
