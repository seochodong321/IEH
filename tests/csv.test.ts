import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("엑셀 한글 호환을 위해 UTF-8 BOM으로 시작한다", () => {
    expect(toCsv(["a"], [["b"]]).startsWith("﻿")).toBe(true);
  });

  it("쉼표·따옴표·줄바꿈이 든 셀을 이스케이프한다", () => {
    const csv = toCsv(["이름"], [['축제 "가을,밤"\n특집']]);
    expect(csv).toContain('"축제 ""가을,밤""\n특집"');
  });

  it("평범한 셀은 그대로 두고 CRLF로 잇는다", () => {
    const csv = toCsv(["a", "b"], [["1", "2"]]);
    expect(csv).toBe("﻿a,b\r\n1,2\r\n");
  });
});
