#!/usr/bin/env python
# coding: utf-8

import ast
import getopt
import sys

import numpy as np
import pandas as pd


def get_mode(inp):
    return list(inp.value_counts().index)[0]


def bin_homogeneity(dataset, to_groupby=["fips"], bins=["lc_type", "bldgtype"]):
    grouped_data = dataset.drop(columns=["loc", "h3"])
    totals = (
        grouped_data.groupby(to_groupby)
        .count()
        .rename(columns={"st_damcat": "total"})
        .iloc[:, 0]
    )
    relative_freq = (
        grouped_data.groupby(to_groupby + bins)
        .count()
        .reset_index()
        .merge(totals, how="left", on=to_groupby)
    )
    to_drop = [column for column in relative_freq.columns if column not in to_groupby + ["freq"] + bins]
    relative_freq = (
        relative_freq.assign(freq=relative_freq.st_damcat / relative_freq.total)
        .drop(columns=to_drop)
        .sort_values(by=to_groupby + ["freq"], ascending=False)
    )

    def filter_cdf(col):
        cutoff = sum(np.cumsum(np.array(col.freq)) <= 0.8)
        return col[:cutoff]

    most_freq = relative_freq.groupby(to_groupby).apply(
        include_groups=False, func=filter_cdf
    ).reset_index()
    most_freq = most_freq.drop(columns=[column for column in most_freq.columns if "level" in column])
    return most_freq, relative_freq


def main(argv):
    inputfile = ""
    outputfile = ""
    type_of_data = ""
    try:
        opts, args = getopt.getopt(argv, "hi:o:t:f::")
    except getopt.GetoptError:
        print("eda_notebook.py -i <inputfile> -o <outputfile> -t <mode or homogeneity or relative> -f <features to groupby>")
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-h":
            print("eda_notebook.py -i <inputfile> -o <outputfile> -t <mode or homogeneity or relative> -f <features to groupby>")
            sys.exit()
        elif opt == "-t":
            type_of_data = arg
        elif opt == "-i":
            input_file = arg
        elif opt == "-o":
            output_file = arg
        elif opt == '-f':
            features = ast.literal_eval(arg)

    data = pd.read_csv(input_file)
    if type_of_data == "mode":
        data.drop(columns=["loc", "h3"]).groupby("fips").agg(get_mode).to_csv(output_file)
    elif type_of_data in ("homogeneity", "relative"):
        most, relative = bin_homogeneity(data, bins=features)
        if type_of_data == "relative":
            relative.set_index("fips").to_csv(output_file)
        if type_of_data == "homogeneity":
            most = most.groupby(["fips"]).count().rename(columns={most.columns[-1]: "count"})
            most.drop(columns=[column for column in most.columns if column != "count"]).to_csv(output_file)
    else:
        print("eda_notebook.py -i <inputfile> -o <outputfile> -t <mode or homogeneity or relative> -f <features to groupby>")


if __name__ == "__main__":
    main(sys.argv[1:])
